import { WS_CHANNELS } from "../wsChannels.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

export const registerOrderStreamHandlers = (_io, socket) => {
  socket.on("admin:join_order_stream", () => {
    const isMasterOwner =
      socket.user?.email?.toLowerCase().trim() ===
      env.MASTER_OWNER_EMAIL?.toLowerCase().trim();

    const isStaff =
      isMasterOwner ||
      ["support_agent", "merchant_admin", "super_admin"].includes(
        socket.user?.role,
      );

    // Multi-tier RBAC Gate: Authorize all staff roles & super admins
    if (!socket.user || !isStaff) {
      logger.warn({
        msg: "Unauthorized socket attempted to join admin order stream",
        socketId: socket.id,
        user: socket.user?.email || "Anonymous",
      });

      return socket.emit(WS_CHANNELS.EVENT_ERROR, {
        message:
          "Forbidden: Staff authorization required to view the live order radar.",
      });
    }

    socket.join(WS_CHANNELS.ADMIN_ORDERS_ROOM);
    logger.info({
      msg: "Staff member joined live order stream room",
      email: socket.user.email,
      role: socket.user.role,
    });
  });

  socket.on("admin:leave_order_stream", () => {
    socket.leave(WS_CHANNELS.ADMIN_ORDERS_ROOM);
  });
};
