// apps/nexus-commerce/backend/src/models/Message.js
import mongoose from "mongoose";

const messageAttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
});

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["customer", "admin", "system"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    attachments: [messageAttachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Ensures message contains either text or at least one attachment
messageSchema.pre("validate", function () {
  const hasText = Boolean(this.text && this.text.trim().length > 0);
  const hasAttachments = Boolean(
    this.attachments && this.attachments.length > 0,
  );

  if (!hasText && !hasAttachments) {
    this.invalidate(
      "text",
      "A message must contain either text or an attachment.",
    );
  }
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
