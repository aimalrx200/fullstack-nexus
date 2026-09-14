import { Order, Variant } from "#models/index.js";
import { addDays } from "date-fns";
import { logger } from "#config/logger.js";

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
  if (!order) throw new Error("Order not found.");

  const currentStatus = order.fulfillmentStatus;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid FSM transition: Cannot move from '${currentStatus}' to '${targetStatus}'.`,
    );
  }

  // Saga compensating rollback on cancellation: Restore physical stock
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

  // Calculate estimated delivery date with date-fns when dispatched
  if (targetStatus === "dispatched") {
    order.courier = order.courier || {};
    order.courier.dispatchDate = new Date();
    const isPKR = order.shippingAddress?.countryCode === "PK";
    order.courier.estimatedDelivery = addDays(new Date(), isPKR ? 2 : 5);
  }

  order.fulfillmentStatus = targetStatus;
  order.timeline.push({
    status: targetStatus.toUpperCase(),
    note: note || `Order transitioned to ${targetStatus.toUpperCase()}`,
    timestamp: new Date(),
    triggeredBy,
  });

  await order.save();
  return order;
};
