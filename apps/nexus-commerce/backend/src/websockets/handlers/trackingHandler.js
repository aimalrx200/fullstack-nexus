import { WS_CHANNELS } from "../wsChannels.js";
import { Order } from "#models/index.js";
import { logger } from "#config/logger.js";

export const registerTrackingHandlers = (_io, socket) => {
  socket.on("order:subscribe_tracking", async ({ orderId }) => {
    if (!orderId) return;

    try {
      const order = await Order.findOne({
        $or: [{ _id: orderId }, { orderNumber: orderId }],
      });
      if (!order) return;

      const isOwner =
        socket.user &&
        order.userId &&
        order.userId.toString() === socket.user.id;
      const isAdmin = socket.user?.role === "merchant_admin";
      const isGuestMatch = !order.userId; // Guest checkout access allowed if looking up with direct order ID

      if (!isOwner && !isAdmin && !isGuestMatch) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Unauthorized to access order tracking.",
        });
      }

      const room = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${order._id}`;
      socket.join(room);
    } catch (err) {
      logger.error({
        msg: "order:subscribe_tracking error",
        error: err.message,
      });
    }
  });

  socket.on("order:unsubscribe_tracking", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`${WS_CHANNELS.TRACKING_ROOM_PREFIX}${orderId}`);
  });
};
