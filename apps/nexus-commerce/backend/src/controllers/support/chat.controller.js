import { Conversation, Message } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { sanitizeInput } from "#utils/sanitize.js";
import { broadcastChatMessage } from "#websockets/wsBroadcaster.js";

export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];
  const { customerName, customerEmail } = req.body;

  let conversation = await Conversation.findOne({
    $or: [
      { ...(userId && { customerId: userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
    status: { $ne: "closed" },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      customerId: userId,
      guestSessionId,
      customerName: sanitizeInput(customerName) || req.user?.name || "Shopper",
      customerEmail: (customerEmail || req.user?.email || "guest@nexus.io")
        .toLowerCase()
        .trim(),
    });
  }

  // Load the latest 50 messages for initial thread load
  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  return res.status(200).json({ success: true, conversation, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, attachments } = req.body;
  const senderType = req.user?.role === "merchant_admin" ? "admin" : "customer";

  const message = await Message.create({
    conversationId,
    senderType,
    senderId: req.user?.id,
    senderName: req.user?.name || "Customer",
    text: sanitizeInput(text),
    attachments: attachments || [],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
    ...(senderType === "customer"
      ? { $inc: { unreadCountAdmin: 1 } }
      : { $inc: { unreadCountCustomer: 1 } }),
  });

  broadcastChatMessage(conversationId, message);

  return res.status(201).json({ success: true, message });
});

/**
 * ⚡ Server-Side Paginated Admin Conversation Inbox
 */
export const getAllConversations = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const { status } = req.query;
  const query = {};

  if (status && status !== "ALL") {
    query.status = status;
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
