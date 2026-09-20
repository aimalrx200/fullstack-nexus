import { WS_CHANNELS } from "../wsChannels.js";
import { Order } from "#models/index.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

export const registerTrackingHandlers = (_io, socket) => {
  socket.on("order:subscribe_tracking", async ({ orderId }) => {
    if (!orderId) return;

    try {
      const order = await Order.findOne({
        $or: [
          { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
          { orderNumber: orderId },
        ].filter(Boolean),
      });

      if (!order) return;

      const isMasterOwner =
        socket.user?.email?.toLowerCase().trim() ===
        env.MASTER_OWNER_EMAIL?.toLowerCase().trim();

      const isStaff =
        isMasterOwner ||
        ["support_agent", "merchant_admin", "super_admin"].includes(
          socket.user?.role,
        );

      const isOwner =
        socket.user &&
        order.userId &&
        order.userId.toString() === socket.user.id;

      // Unauthenticated guest checkout lookup permitted with exact order key
      const isGuestMatch = !order.userId;

      if (!isOwner && !isStaff && !isGuestMatch) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Unauthorized to access order tracking stream.",
        });
      }

      const room = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${order._id}`;
      socket.join(room);

      logger.debug({
        msg: "Socket subscribed to live courier radar tracking",
        socketId: socket.id,
        orderNumber: order.orderNumber,
      });
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
