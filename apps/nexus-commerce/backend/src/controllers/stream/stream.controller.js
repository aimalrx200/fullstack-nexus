import { WS_CHANNELS } from "#websockets/wsChannels.js";
import { subscribeToChannel } from "#services/pubSubService.js";
import { Order, Conversation } from "#models/index.js";
import { logger } from "#config/logger.js";

const initSSEStream = (req, res, channelName, onCleanup) => {
  let isCleanedUp = false;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const safeWrite = (payload) => {
    if (isCleanedUp || res.writableEnded || res.destroyed) return false;
    try {
      res.write(payload);
      return true;
    } catch (err) {
      logger.debug({
        msg: "SSE safeWrite failed; triggering cleanup",
        error: err.message,
      });
      cleanup();
      return false;
    }
  };

  safeWrite(
    `event: connected\ndata: ${JSON.stringify({
      status: "connected",
      channel: channelName,
      timestamp: new Date().toISOString(),
    })}\n\n`,
  );

  const heartbeatTimer = setInterval(() => {
    const success = safeWrite(": keep-alive\n\n");
    if (!success) {
      clearInterval(heartbeatTimer);
    }
  }, 15000);

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    clearInterval(heartbeatTimer);

    if (onCleanup && typeof onCleanup === "function") {
      try {
        onCleanup();
      } catch (err) {
        logger.error({
          msg: "Error executing SSE onCleanup hook",
          error: err.message,
        });
      }
    }

    if (!res.writableEnded && !res.destroyed) {
      try {
        res.end();
      } catch {
        // Stream already closed
      }
    }

    logger.debug({
      msg: "SSE connection and resources cleanly evicted",
      channel: channelName,
    });
  };

  req.on("close", cleanup);
  req.on("end", cleanup);
  res.on("close", cleanup);
  res.on("finish", cleanup);
  res.on("error", cleanup);

  return { safeWrite, cleanup };
};

export const streamAdminOrders = async (req, res) => {
  const channel = WS_CHANNELS.ADMIN_ORDERS_ROOM;
  let unsubscribe = null;

  const { safeWrite } = initSSEStream(req, res, channel, () => {
    if (unsubscribe) unsubscribe();
  });

  unsubscribe = subscribeToChannel(channel, (event) => {
    safeWrite(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });
};

export const streamOrderTracking = async (req, res) => {
  const { orderId } = req.params;
  const queryEmail = (
    req.query.email ||
    req.query.customerEmail ||
    req.headers["x-customer-email"] ||
    ""
  )
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
  const isGuestDirectLookup = !order.userId;

  if (
    !isAdmin &&
    !isRegisteredOwner &&
    !isGuestVerified &&
    !isGuestDirectLookup
  ) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access to live order stream.",
    });
  }

  const channel = `${WS_CHANNELS.TRACKING_ROOM_PREFIX}${order._id}`;
  let unsubscribe = null;

  const { safeWrite } = initSSEStream(req, res, channel, () => {
    if (unsubscribe) unsubscribe();
  });

  unsubscribe = subscribeToChannel(channel, (event) => {
    safeWrite(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });
};

export const streamProductStock = async (req, res) => {
  const { productId } = req.params;
  const channel = `${WS_CHANNELS.STOCK_ROOM_PREFIX}${productId}`;
  let unsubscribe = null;

  const { safeWrite } = initSSEStream(req, res, channel, () => {
    if (unsubscribe) unsubscribe();
  });

  unsubscribe = subscribeToChannel(channel, (event) => {
    safeWrite(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });
};

export const streamChat = async (req, res) => {
  const { conversationId } = req.params;
  const guestSessionId =
    req.query.guestSessionId ||
    req.headers["x-guest-session-id"] ||
    req.query["x-guest-session-id"];

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
    (guestSessionId && conversation.guestSessionId === guestSessionId) ||
    (!conversation.customerId && !req.user);

  const isAdmin = req.user?.role === "merchant_admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access to chat stream." });
  }

  const channel = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
  let unsubscribe = null;

  const { safeWrite } = initSSEStream(req, res, channel, () => {
    if (unsubscribe) unsubscribe();
  });

  unsubscribe = subscribeToChannel(channel, (event) => {
    safeWrite(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
  });
};
