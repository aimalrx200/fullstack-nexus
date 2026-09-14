import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    guestSessionId: {
      type: String,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "escalated"],
      default: "open",
      index: true,
    },
    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCountAdmin: {
      type: Number,
      default: 0,
    },
    unreadCountCustomer: {
      type: Number,
      default: 0,
    },
    cartContextSnapshot: {
      itemCount: { type: Number, default: 0 },
      totalUSD: { type: Number, default: 0 },
      totalPKR: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Conversation", conversationSchema);
