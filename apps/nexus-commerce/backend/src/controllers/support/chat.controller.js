import { Conversation, Message } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { sanitizeInput } from "#utils/sanitize.js";
import { broadcastChatMessage } from "#websockets/wsBroadcaster.js";
import { publishEvent } from "#services/pubSubService.js";
import env from "#config/env.js";

// Helper to reliably check any staff tier (Support Agent, Merchant Admin, Super Admin, Master Owner)
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
 * Get or create an active support thread for an authenticated shopper or guest.
 * POST /api/v1/support/conversation
 */
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.body.guestSessionId;
  const { customerName, customerEmail } = req.body;

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
    });

    publishEvent("admin:support_desk", {
      type: "chat:new_conversation",
      data: conversation,
    });
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return res.status(200).json({ success: true, conversation, messages });
});

/**
 * Load all message history for a specific conversation and reset unread counters
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

  // Reset admin unread counter when any staff member opens the thread
  if (isStaff && conversation.unreadCountAdmin > 0) {
    conversation.unreadCountAdmin = 0;
    await conversation.save();
  } else if (!isStaff && conversation.unreadCountCustomer > 0) {
    conversation.unreadCountCustomer = 0;
    await conversation.save();
  }

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
 * Send message to conversation.
 * POST /api/v1/support/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, attachments } = req.body;
  const isStaff = checkIsStaff(req.user);
  const senderType = isStaff ? "admin" : "customer";

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res
      .status(404)
      .json({ success: false, message: "Conversation not found." });
  }

  const senderName = isStaff
    ? req.user?.name || "Support Specialist"
    : conversation.customerName || "Customer";

  const message = await Message.create({
    conversationId,
    senderType,
    senderId: req.user?.id || null,
    senderName,
    text: sanitizeInput(text),
    attachments: attachments || [],
  });

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessageAt: new Date(),
      status: conversation.status === "closed" ? "open" : conversation.status,
      ...(senderType === "customer"
        ? { $inc: { unreadCountAdmin: 1 } }
        : { $set: { unreadCountAdmin: 0 }, $inc: { unreadCountCustomer: 1 } }),
    },
    { new: true },
  ).populate("customerId", "name email avatarUrl");

  // 1. Broadcast message to conversation room
  broadcastChatMessage(conversationId, message);

  // 2. Broadcast conversation item update to Admin Inbox list
  publishEvent("admin:support_desk", {
    type: "chat:conversation_updated",
    data: {
      conversation: updatedConversation,
      lastMessage: message,
    },
  });

  return res.status(201).json({ success: true, message });
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
