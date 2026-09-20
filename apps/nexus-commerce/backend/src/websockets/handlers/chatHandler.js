import { WS_CHANNELS } from "../wsChannels.js";
import { Message, Conversation } from "#models/index.js";
import { sanitizeInput } from "#utils/sanitize.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

export const registerChatHandlers = (io, socket) => {
  // Helper to evaluate staff privilege across all admin/support tiers
  const checkIsStaff = (user) => {
    if (!user) return false;
    const isMasterOwner =
      user.email?.toLowerCase().trim() ===
      env.MASTER_OWNER_EMAIL?.toLowerCase().trim();

    return (
      isMasterOwner ||
      ["support_agent", "merchant_admin", "super_admin"].includes(user.role)
    );
  };

  // 1. Join Conversation Room with Ownership / Staff Check
  socket.on("chat:join", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Conversation not found.",
        });
      }

      const isOwner =
        (socket.user &&
          conversation.customerId &&
          conversation.customerId.toString() === socket.user.id) ||
        (socket.guestSessionId &&
          conversation.guestSessionId === socket.guestSessionId) ||
        (!conversation.customerId && !socket.user);

      const isStaff = checkIsStaff(socket.user);

      if (!isOwner && !isStaff) {
        return socket.emit(WS_CHANNELS.EVENT_ERROR, {
          message: "Access denied to conversation thread.",
        });
      }

      const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
      socket.join(room);

      logger.debug({
        msg: "Socket joined chat room",
        socketId: socket.id,
        conversationId,
        role: isStaff ? socket.user.role : "customer",
      });
    } catch (err) {
      logger.error({ msg: "chat:join error", error: err.message });
    }
  });

  // 2. Real-Time Typing Indicators
  socket.on("chat:typing", ({ conversationId, isTyping }) => {
    if (!conversationId) return;
    const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
    const isStaff = checkIsStaff(socket.user);

    const senderName =
      socket.user?.name || (isStaff ? "Support Specialist" : "Customer");

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

      const isStaff = checkIsStaff(socket.user);
      const senderType = isStaff ? "admin" : "customer";
      const senderName =
        socket.user?.name ||
        (isStaff
          ? "Support Specialist"
          : conversation.customerName || "Customer");
      const cleanText = sanitizeInput(text);

      const messageDoc = await Message.create({
        conversationId,
        senderType,
        senderId: socket.user?.id || null,
        senderName,
        text: cleanText,
        attachments: Array.isArray(attachments) ? attachments : [],
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date(),
        status: conversation.status === "closed" ? "open" : conversation.status,
        ...(isStaff
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
      const isStaff = checkIsStaff(socket.user);
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: isStaff ? { unreadCountAdmin: 0 } : { unreadCountCustomer: 0 },
      });

      const room = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
      socket.to(room).emit(WS_CHANNELS.EVENT_CHAT_READ, {
        conversationId,
        readBy: isStaff ? "admin" : "customer",
      });
    } catch (err) {
      logger.error({ msg: "chat:mark_read exception", error: err.message });
    }
  });
};
