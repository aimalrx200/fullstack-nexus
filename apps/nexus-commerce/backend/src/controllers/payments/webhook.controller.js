// apps/nexus-commerce/backend/src/controllers/payments/webhook.controller.js

import { PaymentGatewayFactory } from "#gateways/PaymentGatewayFactory.js";
import { Order, WebhookEvent, PaymentTransaction } from "#models/index.js";
import {
  commitInventoryDeduction,
  releaseInventoryHold,
} from "#services/inventoryLockService.js";
import { transitionOrderStatus } from "#services/orderFSMService.js";
import { logger } from "#config/logger.js";

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const gateway = PaymentGatewayFactory.getAdapter("stripe");

  let event;
  try {
    event = await gateway.verifyWebhook(req.body, sig);
  } catch (err) {
    logger.error({
      msg: "Stripe HMAC signature validation failed",
      error: err.message,
    });
    return res.status(400).send(`Webhook Signature Error: ${err.message}`);
  }

  // 1. Idempotency Deduplication Gate (Guarantees at-most-once processing)
  const existing = await WebhookEvent.findOne({ eventId: event.id });
  if (existing) {
    logger.info({ msg: "Stripe webhook duplicate ignored", eventId: event.id });
    return res.status(200).json({ received: true, deduplicated: true });
  }

  await WebhookEvent.create({
    eventId: event.id,
    gateway: "stripe",
    eventType: event.type,
    payload: event.data?.object || event.data,
  });

  // 2. Event: Payment Succeeded (payment_intent.succeeded)
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { orderId, orderNumber } = paymentIntent.metadata || {};

    const order = await Order.findById(orderId);
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();

      // State machine transition to confirmed
      await transitionOrderStatus({
        orderId: order._id,
        targetStatus: "confirmed",
        note: `Payment authorized via Stripe (${paymentIntent.id})`,
        triggeredBy: "stripe_webhook",
      });

      // Commit physical warehouse inventory deduction atomically
      await commitInventoryDeduction(order.items);

      // Record successful transaction in ledger
      await PaymentTransaction.create({
        orderId: order._id,
        orderNumber: orderNumber || order.orderNumber,
        gateway: "stripe",
        gatewayTransactionId: paymentIntent.id,
        amount: order.pricing.total,
        currency: order.pricing.currency,
        status: "success",
        rawGatewayResponse: paymentIntent,
      });

      logger.info({
        msg: "💳 Stripe payment processed & stock deducted atomically",
        orderNumber: order.orderNumber,
        paymentIntentId: paymentIntent.id,
      });
    }
  }

  // 3. Event: Payment Failed (payment_intent.payment_failed)
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata || {};

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "failed";
      order.timeline.push({
        status: "PAYMENT_FAILED",
        note: `Stripe payment declined: ${paymentIntent.last_payment_error?.message || "Card authentication failed"}`,
        timestamp: new Date(),
        triggeredBy: "stripe_webhook",
      });
      await order.save();

      // Compensating action: Release temporary stock reservation
      await releaseInventoryHold(order._id.toString(), order._id.toString());

      logger.warn({
        msg: "🚨 Stripe payment failed; inventory holds released",
        orderNumber: order.orderNumber,
      });
    }
  }

  return res.status(200).json({ received: true });
};

export const handleJazzCashCallback = async (req, res) => {
  const gateway = PaymentGatewayFactory.getAdapter("jazzcash");
  const verification = await gateway.verifyWebhook(req.body);

  if (!verification.isAuthentic) {
    logger.warn({
      msg: "🚨 JazzCash callback authenticity verification failed",
    });
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature hash" });
  }

  const eventId = `JC_${verification.transactionId || req.body.pp_TxnRefNo || Date.now()}`;

  const existing = await WebhookEvent.findOne({ eventId });
  if (existing) {
    logger.info({ msg: "JazzCash callback duplicate ignored", eventId });
    return res.status(200).json({ success: true, deduplicated: true });
  }

  await WebhookEvent.create({
    eventId,
    gateway: "jazzcash",
    eventType: verification.isPaid ? "payment.success" : "payment.failed",
    payload: req.body,
  });

  if (verification.isPaid) {
    const order = await Order.findOne({
      orderNumber: verification.orderNumber,
    });

    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();

      await transitionOrderStatus({
        orderId: order._id,
        targetStatus: "confirmed",
        note: `Payment verified via JazzCash IPN (${verification.transactionId})`,
        triggeredBy: "jazzcash_ipn",
      });

      await commitInventoryDeduction(order.items);

      await PaymentTransaction.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        gateway: "jazzcash",
        gatewayTransactionId: verification.transactionId,
        amount: order.pricing.total,
        currency: order.pricing.currency,
        status: "success",
        rawGatewayResponse: req.body,
      });
    }
  }

  return res.status(200).json({ success: true });
};

export const handleEasypaisaCallback = async (req, res) => {
  const gateway = PaymentGatewayFactory.getAdapter("easypaisa");
  const verification = await gateway.verifyWebhook(req.body);

  if (!verification.isAuthentic) {
    logger.warn({ msg: "🚨 Easypaisa callback checksum verification failed" });
    return res
      .status(400)
      .json({ success: false, message: "Invalid checksum" });
  }

  const eventId = `EP_${verification.transactionId || req.body.orderRefNum || Date.now()}`;

  const existing = await WebhookEvent.findOne({ eventId });
  if (existing) {
    logger.info({ msg: "Easypaisa callback duplicate ignored", eventId });
    return res.status(200).json({ success: true, deduplicated: true });
  }

  await WebhookEvent.create({
    eventId,
    gateway: "easypaisa",
    eventType: verification.isPaid ? "payment.success" : "payment.failed",
    payload: req.body,
  });

  if (verification.isPaid) {
    const order = await Order.findOne({
      orderNumber: verification.orderNumber,
    });

    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();

      await transitionOrderStatus({
        orderId: order._id,
        targetStatus: "confirmed",
        note: `Payment verified via Easypaisa IPN (${verification.transactionId})`,
        triggeredBy: "easypaisa_ipn",
      });

      await commitInventoryDeduction(order.items);

      await PaymentTransaction.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        gateway: "easypaisa",
        gatewayTransactionId: verification.transactionId,
        amount: order.pricing.total,
        currency: order.pricing.currency,
        status: "success",
        rawGatewayResponse: req.body,
      });
    }
  }

  return res.status(200).json({ success: true });
};
