import { WS_CHANNELS } from "../wsChannels.js";
import { Message, Conversation } from "#models/index.js";
import { sanitizeInput } from "#utils/sanitize.js";
import { logger } from "#config/logger.js";

export const registerChatHandlers = (io, socket) => {
  // 1. Join Conversation Room with Ownership Check
  socket.on("chat:join", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Conversation not found.",
        });
      }

      // Check if user is the conversation owner OR a merchant admin
      const isOwner =
        (socket.user &&
          conversation.customerId &&
          conversation.customerId.toString() === socket.user.id) ||
        (socket.guestSessionId &&
          conversation.guestSessionId === socket.guestSessionId);

      const isAdmin = socket.user?.role === "merchant_admin";

      if (!isOwner && !isAdmin) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Access denied to conversation.",
        });
      }

      const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
      socket.join(room);
      logger.debug({
        msg: "Socket joined chat room",
        socketId: socket.id,
        conversationId,
        role: isAdmin ? "admin" : "customer",
      });
    } catch (err) {
      logger.error({ msg: "chat:join error", error: err.message });
    }
  });

  // 2. Real-Time Typing Indicators
  socket.on("chat:typing", ({ conversationId, isTyping }) => {
    if (!conversationId) return;
    const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
    const senderName =
      socket.user?.name ||
      (socket.user?.role === "merchant_admin" ? "Support Agent" : "Customer");

    socket.to(room).emit(WS_CHANNELS.EVENT_CHAT_TYPING, {
      conversationId,
      senderName,
      isTyping: Boolean(isTyping),
    });
  });

  // 3. Real-Time Message Dispatch with XSS Sanitization
  socket.on("chat:send", async ({ conversationId, text, attachments }) => {
    if (!conversationId || !text || !text.trim()) return;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.status === "closed") {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Cannot send message to a closed thread.",
        });
      }

      const isAdmin = socket.user?.role === "merchant_admin";
      const senderType = isAdmin ? "admin" : "customer";
      const senderName =
        socket.user?.name ||
        (isAdmin
          ? "Support Specialist"
          : conversation.customerName || "Customer");
      const cleanText = sanitizeInput(text);

      const messageDoc = await Message.create({
        conversationId,
        senderType,
        senderId: socket.user?.id,
        senderName,
        text: cleanText,
        attachments: Array.isArray(attachments) ? attachments : [],
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date(),
        ...(isAdmin
          ? { $inc: { unreadCountCustomer: 1 } }
          : { $inc: { unreadCountAdmin: 1 } }),
      });

      const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
      io.to(room).emit(WS_CHANNELS.EVENT_CHAT_MESSAGE, messageDoc);
    } catch (err) {
      logger.error({
        msg: "Socket chat message creation failed",
        error: err.message,
      });
    }
  });

  // 4. Read Receipt Acknowledgement
  socket.on("chat:mark_read", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const isAdmin = socket.user?.role === "merchant_admin";
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: isAdmin ? { unreadCountAdmin: 0 } : { unreadCountCustomer: 0 },
      });

      const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
      socket.to(room).emit(WS_CHANNELS.EVENT_CHAT_READ, {
        conversationId,
        readBy: isAdmin ? "admin" : "customer",
      });
    } catch (err) {
      logger.error({ msg: "chat:mark_read exception", error: err.message });
    }
  });
};
