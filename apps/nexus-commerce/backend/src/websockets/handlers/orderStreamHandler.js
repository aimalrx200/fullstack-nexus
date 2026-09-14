import { WS_CHANNELS } from "../wsChannels.js";
import { logger } from "#config/logger.js";

export const registerOrderStreamHandlers = (_io, socket) => {
  socket.on("admin:join_order_stream", () => {
    // Strict RBAC Gate: Only authenticated merchant admins may join
    if (!socket.user || socket.user.role !== "merchant_admin") {
      logger.warn({
        msg: "Unauthorized socket attempted to join admin order stream",
        socketId: socket.id,
        user: socket.user?.email || "Anonymous",
      });

      return socket.emit(WS_CHANNELS.EVENT_ERROR, {
        message:
          "Forbidden: Merchant Administrator access required to view live order stream.",
      });
    }

    socket.join(WS_CHANNELS.ADMIN_ORDERS_ROOM);
    logger.info({
      msg: "Merchant Admin joined live order stream room",
      email: socket.user.email,
    });
  });

  socket.on("admin:leave_order_stream", () => {
    socket.leave(WS_CHANNELS.ADMIN_ORDERS_ROOM);
  });
};
