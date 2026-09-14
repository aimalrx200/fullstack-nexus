import { Order, PaymentTransaction } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { PaymentGatewayFactory } from "#gateways/PaymentGatewayFactory.js";
import { setIdempotencyRecord } from "#utils/idempotencyStore.js";

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
