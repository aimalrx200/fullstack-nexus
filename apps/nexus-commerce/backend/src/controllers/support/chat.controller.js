// apps/nexus-commerce/backend/src/controllers/support/chat.controller.js
import { Conversation, Message } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { sanitizeInput } from "#utils/sanitize.js";
import {
  broadcastChatMessage,
  getSocketIOInstance,
} from "#websockets/wsBroadcaster.js";
import { publishEvent } from "#services/pubSubService.js";
import { WS_CHANNELS } from "#websockets/wsChannels.js";
import env from "#config/env.js";

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

/**
 * Load all message history and mark opposing messages as read (isRead = true)
 * GET /api/v1/support/conversations/:conversationId/messages
 */
export const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId).populate(
    "customerId",
    "name email avatarUrl",
  );

  if (!conversation) {
    return res
      .status(404)
      .json({ success: false, message: "Conversation not found." });
  }

  const isStaff = checkIsStaff(req.user);

  // 1. Reset counters and mark opposite messages as read
  if (isStaff) {
    if (conversation.unreadCountAdmin > 0) {
      conversation.unreadCountAdmin = 0;
      await conversation.save();
    }
    // Mark customer messages as read
    await Message.updateMany(
      { conversationId, senderType: "customer", isRead: false },
      { $set: { isRead: true } },
    );
  } else {
    if (conversation.unreadCountCustomer > 0) {
      conversation.unreadCountCustomer = 0;
      await conversation.save();
    }
    // Mark admin messages as read
    await Message.updateMany(
      { conversationId, senderType: "admin", isRead: false },
      { $set: { isRead: true } },
    );
  }

  // 2. Broadcast read receipt to room
  const chatRoom = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;
  publishEvent(chatRoom, {
    type: WS_CHANNELS.EVENT_CHAT_READ,
    data: {
      conversationId,
      readBy: isStaff ? "admin" : "customer",
    },
  });

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    conversation,
    messages,
  });
});

/**
 * Broadcast typing indicator across both Sockets and SSE/Redis PubSub
 * POST /api/v1/support/typing
 */
export const broadcastTypingStatus = asyncHandler(async (req, res) => {
  const { conversationId, isTyping } = req.body;
  if (!conversationId) {
    return res
      .status(400)
      .json({ success: false, message: "conversationId is required" });
  }

  const isStaff = checkIsStaff(req.user);
  const senderName = isStaff
    ? req.user?.name || "Support Specialist"
    : "Customer";
  const chatRoom = `${WS_CHANNELS.CHAT_ROOM_PREFIX}${conversationId}`;

  const payload = {
    conversationId,
    senderName,
    isTyping: Boolean(isTyping),
  };

  // Socket broadcast (Localhost)
  const io = getSocketIOInstance();
  if (io) {
    io.to(chatRoom).emit(WS_CHANNELS.EVENT_CHAT_TYPING, payload);
  }

  // SSE / Redis PubSub broadcast (Production Serverless)
  publishEvent(chatRoom, {
    type: WS_CHANNELS.EVENT_CHAT_TYPING,
    data: payload,
  });

  return res.status(200).json({ success: true });
});

/**
 * Get active support thread if it exists
 * POST /api/v1/support/conversation
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.body.guestSessionId;

  let conversation = null;

  if (userId) {
    conversation = await Conversation.findOne({
      customerId: userId,
      status: { $ne: "closed" },
    });
  } else if (guestSessionId) {
    conversation = await Conversation.findOne({
      guestSessionId,
      status: { $ne: "closed" },
    });
  }

  if (!conversation) {
    return res.status(200).json({
      success: true,
      conversation: null,
      messages: [],
    });
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return res.status(200).json({ success: true, conversation, messages });
});

/**
 * Send message to conversation
 * POST /api/v1/support/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, attachments, customerName, customerEmail } =
    req.body;
  const isStaff = checkIsStaff(req.user);
  const senderType = isStaff ? "admin" : "customer";
  const userId = req.user?.id;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.body.guestSessionId;

  let conversation = null;
  let isNewConversation = false;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
  }

  if (!conversation) {
    if (userId) {
      conversation = await Conversation.findOne({
        customerId: userId,
        status: { $ne: "closed" },
      });
    } else if (guestSessionId) {
      conversation = await Conversation.findOne({
        guestSessionId,
        status: { $ne: "closed" },
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        customerId: userId || null,
        guestSessionId: !userId ? guestSessionId : null,
        customerName:
          sanitizeInput(customerName) ||
          req.user?.name ||
          (userId ? "VIP Customer" : "Guest Shopper"),
        customerEmail: (
          customerEmail ||
          req.user?.email ||
          (userId
            ? "customer@nexus.io"
            : `guest_${Date.now().toString().slice(-4)}@nexus.io`)
        )
          .toLowerCase()
          .trim(),
        unreadCountAdmin: isStaff ? 0 : 1,
        lastMessageAt: new Date(),
      });

      isNewConversation = true;
    }
  }

  const senderName = isStaff
    ? req.user?.name || "Support Specialist"
    : conversation.customerName || "Customer";

  const message = await Message.create({
    conversationId: conversation._id,
    senderType,
    senderId: req.user?.id || null,
    senderName,
    text: sanitizeInput(text),
    attachments: attachments || [],
    isRead: false,
  });

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversation._id,
    {
      lastMessageAt: new Date(),
      status: conversation.status === "closed" ? "open" : conversation.status,
      ...(senderType === "customer"
        ? { $inc: { unreadCountAdmin: isNewConversation ? 0 : 1 } }
        : { $set: { unreadCountAdmin: 0 }, $inc: { unreadCountCustomer: 1 } }),
    },
    { new: true },
  ).populate("customerId", "name email avatarUrl");

  // 1. Broadcast message to active chat window
  broadcastChatMessage(conversation._id, message);

  // 2. Broadcast to Admin Inbox
  if (isNewConversation) {
    publishEvent("admin:support_desk", {
      type: "chat:new_conversation",
      data: updatedConversation,
    });
  } else {
    publishEvent("admin:support_desk", {
      type: "chat:conversation_updated",
      data: {
        conversation: updatedConversation,
        lastMessage: message,
      },
    });
  }

  return res
    .status(201)
    .json({ success: true, message, conversation: updatedConversation });
});

/**
 * Server-Side Paginated Admin Support Inbox
 * GET /api/v1/support/conversations
 */
export const getAllConversations = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 25));
  const skip = (page - 1) * limit;

  const { status, type, search } = req.query;
  const query = {};

  if (status && status !== "ALL") {
    query.status = status;
  }

  if (type === "customers") {
    query.customerId = { $ne: null };
  } else if (type === "guests") {
    query.customerId = null;
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { customerName: { $regex: term, $options: "i" } },
      { customerEmail: { $regex: term, $options: "i" } },
    ];
  }

  const [conversations, totalCount] = await Promise.all([
    Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customerId", "name email avatarUrl")
      .lean(),
    Conversation.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    conversations,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});
