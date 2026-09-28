// apps/nexus-commerce/backend/src/services/orderFSMService.js

import { Order, Variant, PaymentTransaction } from "#models/index.js";
import { addDays } from "date-fns";
import { logger } from "#config/logger.js";
import { broadcastOrderStatusUpdate } from "#websockets/wsBroadcaster.js";

const VALID_TRANSITIONS = {
  unfulfilled: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered", "returned", "cancelled"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const transitionOrderStatus = async ({
  orderId,
  targetStatus,
  note,
  triggeredBy = "system",
}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error("Order not found.");
    err.statusCode = 404;
    throw err;
  }

  const currentStatus = order.fulfillmentStatus;

  // 1. Idempotency Guard
  if (currentStatus === targetStatus) {
    logger.debug({
      msg: "Order already in target status; idempotent no-op returned",
      orderNumber: order.orderNumber,
      status: targetStatus,
    });
    return order;
  }

  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  // 2. Clean 400 validation
  if (!allowed.includes(targetStatus)) {
    const err = new Error(
      `Invalid FSM transition: Cannot move from '${currentStatus}' to '${targetStatus}'. Allowed transitions: [${allowed.join(", ") || "none"}].`,
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Saga Compensating Rollback on Cancellation
  if (targetStatus === "cancelled" && currentStatus !== "unfulfilled") {
    logger.info({
      msg: "Saga rollback: Restoring inventory for cancelled order",
      orderNumber: order.orderNumber,
    });
    for (const item of order.items) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  // 4. Calculate Delivery Estimation on Dispatch
  if (targetStatus === "dispatched") {
    order.courier = order.courier || {};
    order.courier.dispatchDate = new Date();
    const isPKR = order.shippingAddress?.countryCode === "PK";
    order.courier.estimatedDelivery = addDays(new Date(), isPKR ? 2 : 5);
  }

  // ⚡ 5. AUTOMATIC CASH ON DELIVERY (COD) PAYMENT SETTLEMENT ON DELIVERY
  if (
    targetStatus === "delivered" &&
    order.paymentMethod === "cod" &&
    order.paymentStatus !== "paid"
  ) {
    order.paymentStatus = "paid";

    // Log Cash Collection in the Accounting Transaction Ledger
    await PaymentTransaction.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      gateway: "cod",
      gatewayTransactionId: `COD_SETTLED_${order.orderNumber}_${Date.now().toString().slice(-4)}`,
      amount: order.pricing.total,
      currency: order.pricing.currency,
      status: "success",
      rawGatewayResponse: {
        settlementType: "doorstep_cash_collection",
        collectedBy: order.courier?.carrier || "Courier Agent",
        settledAt: new Date().toISOString(),
      },
    });

    order.timeline.push({
      status: "PAID",
      note: `Cash payment of ${order.pricing.currency === "PKR" ? "Rs " : "$"}${order.pricing.total} collected by courier rider at doorstep`,
      timestamp: new Date(),
      triggeredBy: "courier_cash_collection",
    });

    logger.info({
      msg: "💵 COD Payment auto-settled upon successful physical delivery",
      orderNumber: order.orderNumber,
      amount: order.pricing.total,
    });
  }

  order.fulfillmentStatus = targetStatus;
  order.timeline.push({
    status: targetStatus.toUpperCase(),
    note: note || `Order transitioned to ${targetStatus.toUpperCase()}`,
    timestamp: new Date(),
    triggeredBy,
  });

  await order.save();

  // ⚡ 6. Broadcast BOTH fulfillmentStatus and paymentStatus to Live Streams
  broadcastOrderStatusUpdate(
    order._id,
    targetStatus,
    order.timeline,
    order.paymentStatus,
  );

  return order;
};
