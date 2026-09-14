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

  // Idempotency Deduplication Gate
  const existing = await WebhookEvent.findOne({ eventId: event.id });
  if (existing) {
    logger.info({ msg: "Stripe webhook duplicate ignored", eventId: event.id });
    return res.status(200).json({ received: true, deduplicated: true });
  }

  await WebhookEvent.create({
    eventId: event.id,
    gateway: "stripe",
    eventType: event.type,
    payload: event.data.object,
  });

  // Event 1: Payment Succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { orderId, orderNumber } = paymentIntent.metadata || {};

    const order = await Order.findById(orderId);
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();

      await transitionOrderStatus({
        orderId: order._id,
        targetStatus: "confirmed",
        note: `Payment authorized via Stripe (${paymentIntent.id})`,
        triggeredBy: "stripe_webhook",
      });

      await commitInventoryDeduction(order.items);

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
    }
  }

  // Event 2: Payment Failed
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata || {};

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "failed";
      await order.save();
      await releaseInventoryHold(order._id.toString(), order._id.toString());
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

  // Idempotency Deduplication Gate
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

  // Idempotency Deduplication Gate
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
