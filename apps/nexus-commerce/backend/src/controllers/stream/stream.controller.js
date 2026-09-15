import { WS_CHANNELS } from "#websockets/wsChannels.js";
import { subscribeToChannel } from "#services/pubSubService.js";
import { Order, Conversation } from "#models/index.js";
import { logger } from "#config/logger.js";

/**
 * Utility helper to set SSE headers and start keep-alive heartbeat.
 */
const initSSEStream = (res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disables Nginx/Vercel buffering
  });

  // Initial handshake packet
  res.write(
    `event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: new Date().toISOString() })}\n\n`,
  );

  // 15-second keep-alive heartbeat to prevent edge proxy disconnects
  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 15000);

  const cleanup = () => {
    clearInterval(heartbeat);
  };

  return { cleanup };
};

/**
 * 1. Admin Live Order & Status Stream
 * GET /api/v1/stream/admin
 */
export const streamAdminOrders = async (req, res) => {
  const { cleanup } = initSSEStream(res);

  const unsubscribe = subscribeToChannel(
    WS_CHANNELS.ADMIN_ORDERS_ROOM,
    (event) => {
      res.write(
        `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`,
      );
    },
  );

  req.on("close", () => {
    cleanup();
    unsubscribe();
    logger.debug({ msg: "Admin SSE stream connection closed by client" });
  });
};

/**
 * 2. Live Order Courier GPS & Status Tracking Stream
 * GET /api/v1/stream/orders/:orderId
 */
export const streamOrderTracking = async (req, res) => {
  const { orderId } = req.params;
  const queryEmail = (req.query.email || req.headers["x-customer-email"] || "")
    .trim()
    .toLowerCase();

  const order = await Order.findOne({
    $or: [
      { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
      { orderNumber: orderId },
    ].filter(Boolean),
  });

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  const isAdmin = req.user?.role === "merchant_admin";
  const isRegisteredOwner =
    req.user && order.userId && req.user.id === order.userId.toString();
  const isGuestVerified =
    !order.userId &&
    queryEmail &&
    queryEmail === order.customerEmail.toLowerCase();

  if (!isAdmin && !isRegisteredOwner && !isGuestVerified) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access to live order stream.",
    });
  }

  const { cleanup } = initSSEStream(res);
  const channel = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${order._id}`;

  const unsubscribe = subscribeToChannel(channel, (event) => {
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });

  req.on("close", () => {
    cleanup();
    unsubscribe();
  });
};

/**
 * 3. Flash-Sale Live Stock Drops Stream
 * GET /api/v1/stream/products/:productId
 */
export const streamProductStock = async (req, res) => {
  const { productId } = req.params;
  const { cleanup } = initSSEStream(res);

  const channel = `${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`;

  const unsubscribe = subscribeToChannel(channel, (event) => {
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });

  req.on("close", () => {
    cleanup();
    unsubscribe();
  });
};

/**
 * 4. Customer Support Live Chat Stream
 * GET /api/v1/stream/chat/:conversationId
 */
export const streamChat = async (req, res) => {
  const { conversationId } = req.params;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.query.guestSessionId;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res
      .status(404)
      .json({ success: false, message: "Conversation not found." });
  }

  const isOwner =
    (req.user &&
      conversation.customerId &&
      conversation.customerId.toString() === req.user.id) ||
    (guestSessionId && conversation.guestSessionId === guestSessionId);
  const isAdmin = req.user?.role === "merchant_admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access to chat stream." });
  }

  const { cleanup } = initSSEStream(res);
  const channel = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;

  const unsubscribe = subscribeToChannel(channel, (event) => {
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });

  req.on("close", () => {
    cleanup();
    unsubscribe();
  });
};
