import Stripe from "stripe";
import { Order, PaymentTransaction } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { PaymentGatewayFactory } from "#gateways/PaymentGatewayFactory.js";
import { setIdempotencyRecord } from "#utils/idempotencyStore.js";
import { commitInventoryDeduction } from "#services/inventoryLockService.js";
import { transitionOrderStatus } from "#services/orderFSMService.js";
import { broadcastOrderStatusUpdate } from "#websockets/wsBroadcaster.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: false,
});

export const retryPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, mobileNumber, idempotencyKey } = req.body;

  const order = await Order.findById(orderId);
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });

  if (order.paymentStatus === "paid") {
    return res
      .status(400)
      .json({ success: false, message: "This order has already been paid." });
  }

  order.paymentMethod = paymentMethod;
  await order.save();

  const gateway = PaymentGatewayFactory.getAdapter(paymentMethod);
  const paymentResult = await gateway.initiatePayment({
    order,
    mobileNumber,
    idempotencyKey,
  });

  const responsePayload = {
    success: true,
    message: `Payment initiated via ${paymentMethod.toUpperCase()}`,
    orderNumber: order.orderNumber,
    payment: paymentResult,
  };

  if (idempotencyKey) {
    await setIdempotencyRecord(idempotencyKey, responsePayload);
  }

  return res.status(200).json(responsePayload);
});

export const processRefund = asyncHandler(async (req, res) => {
  const { orderId, transactionId, amount, reason } = req.body;

  const order = await Order.findById(orderId);
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });

  const gateway = PaymentGatewayFactory.getAdapter(order.paymentMethod);
  const refundResult = await gateway.processRefund(
    transactionId,
    amount,
    reason,
  );

  order.paymentStatus = "refunded";
  order.timeline.push({
    status: "Refund Processed",
    note: `Refund of ${order.pricing.currency === "PKR" ? "Rs " + amount : "$" + amount} processed. Reason: ${reason}`,
    triggeredBy: req.user.name || "merchant_admin",
  });
  await order.save();

  await PaymentTransaction.create({
    orderId: order._id,
    orderNumber: order.orderNumber,
    gateway: order.paymentMethod,
    gatewayTransactionId: refundResult.refundId || `REF_${Date.now()}`,
    amount,
    currency: order.pricing.currency,
    status: "refunded",
    rawGatewayResponse: refundResult,
  });

  return res.status(200).json({
    success: true,
    message: "Refund processed successfully.",
    refund: refundResult,
  });
});

/**
 * Server-Side Paginated Payment Transaction Ledger
 */
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const { gateway, status, search } = req.query;
  const query = {};

  if (gateway && gateway !== "ALL") query.gateway = gateway;
  if (status && status !== "ALL") query.status = status;
  if (search && search.trim()) {
    query.$or = [
      { orderNumber: { $regex: search.trim(), $options: "i" } },
      { gatewayTransactionId: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [transactions, totalCount] = await Promise.all([
    PaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PaymentTransaction.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    transactions,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});

/**
 * Direct Client Stripe Payment Confirmation
 * POST /api/v1/payments/confirm-stripe
 */
export const confirmStripePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentIntentId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Order has already been verified and paid.",
      order,
    });
  }

  // 1. Verify PaymentIntent with Stripe API directly (or mock in development when using placeholders)
  let paymentIntentStatus = "succeeded";
  let paymentIntentData = { id: paymentIntentId || `pi_mock_${Date.now()}` };

  if (
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_SECRET_KEY !== "sk_test_placeholder_key" &&
    paymentIntentId &&
    !paymentIntentId.startsWith("pi_mock_")
  ) {
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentIntentStatus = intent.status;
      paymentIntentData = intent;
    } catch (err) {
      logger.error({
        msg: "Stripe intent retrieval error",
        error: err.message,
      });
      return res.status(400).json({
        success: false,
        message: "Unable to verify payment with Stripe.",
      });
    }
  }

  if (paymentIntentStatus !== "succeeded") {
    return res.status(400).json({
      success: false,
      message: `Payment status is ${paymentIntentStatus}. Payment has not been authorized.`,
    });
  }

  // 2. Transition order fulfillment status and mark as paid
  order.paymentStatus = "paid";

  if (order.fulfillmentStatus === "unfulfilled") {
    await transitionOrderStatus({
      orderId: order._id,
      targetStatus: "confirmed",
      note: `Payment verified via Stripe (${paymentIntentData.id})`,
      triggeredBy: "stripe_direct_confirm",
    });
  } else {
    order.timeline.push({
      status: "PAID",
      note: `Payment authorized via Stripe (${paymentIntentData.id})`,
      timestamp: new Date(),
      triggeredBy: "stripe_direct_confirm",
    });
    await order.save();

    broadcastOrderStatusUpdate(
      order._id,
      order.fulfillmentStatus,
      order.timeline,
      order.paymentStatus,
    );
  }

  // 3. Atomically commit physical warehouse inventory deduction
  await commitInventoryDeduction(order.items);

  // 4. Record transaction in database ledger
  await PaymentTransaction.create({
    orderId: order._id,
    orderNumber: order.orderNumber,
    gateway: "stripe",
    gatewayTransactionId: paymentIntentData.id,
    amount: order.pricing.total,
    currency: order.pricing.currency,
    status: "success",
    rawGatewayResponse: paymentIntentData,
  });

  logger.info({
    msg: "💳 Stripe payment verified & warehouse stock committed atomically",
    orderNumber: order.orderNumber,
    paymentIntentId: paymentIntentData.id,
  });

  return res.status(200).json({
    success: true,
    message: "Stripe payment verified successfully.",
    order,
  });
});

/**
 * Authorize simulated JazzCash / Easypaisa mobile wallet payments
 * POST /api/v1/payments/authorize-wallet
 */
export const authorizeWalletPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, mobileNumber, mpin } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json({
      success: true,
      message: "Order has already been paid.",
      order,
    });
  }

  const cleanGateway = paymentMethod?.toLowerCase() || order.paymentMethod;
  if (cleanGateway !== "jazzcash" && cleanGateway !== "easypaisa") {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile wallet gateway specified.",
    });
  }

  const txnPrefix = cleanGateway === "jazzcash" ? "JC_TXN" : "EP_TXN";
  const gatewayTxnId = `${txnPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  order.paymentStatus = "paid";
  order.paymentMethod = cleanGateway;

  if (order.fulfillmentStatus === "unfulfilled") {
    await transitionOrderStatus({
      orderId: order._id,
      targetStatus: "confirmed",
      note: `Payment authorized via ${cleanGateway.toUpperCase()} Mobile Wallet (${mobileNumber || order.customerPhone})`,
      triggeredBy: `${cleanGateway}_wallet_approval`,
    });
  } else {
    order.timeline.push({
      status: "PAID",
      note: `Payment of ${order.pricing.currency === "PKR" ? "Rs " : "$"}${order.pricing.total} approved via ${cleanGateway.toUpperCase()}`,
      timestamp: new Date(),
      triggeredBy: `${cleanGateway}_wallet_approval`,
    });
    await order.save();

    broadcastOrderStatusUpdate(
      order._id,
      order.fulfillmentStatus,
      order.timeline,
      order.paymentStatus,
    );
  }

  // Atomically commit warehouse inventory
  await commitInventoryDeduction(order.items);

  // Record transaction in ledger
  await PaymentTransaction.create({
    orderId: order._id,
    orderNumber: order.orderNumber,
    gateway: cleanGateway,
    gatewayTransactionId: gatewayTxnId,
    amount: order.pricing.total,
    currency: order.pricing.currency,
    status: "success",
    rawGatewayResponse: {
      type: "mobile_wallet_direct_debit",
      authorizedPhone: mobileNumber || order.customerPhone,
      simulatedMPIN: mpin ? "****" : "N/A",
      gatewayTxnId,
      settledAt: new Date().toISOString(),
    },
  });

  logger.info({
    msg: `📱 ${cleanGateway.toUpperCase()} mobile wallet payment authorized & confirmed`,
    orderNumber: order.orderNumber,
    transactionId: gatewayTxnId,
    amount: order.pricing.total,
  });

  return res.status(200).json({
    success: true,
    message: `${cleanGateway === "jazzcash" ? "JazzCash" : "Easypaisa"} payment approved successfully!`,
    order,
    transactionId: gatewayTxnId,
  });
});
