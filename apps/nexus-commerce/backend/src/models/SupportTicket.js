import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["payment_issue", "shipping", "product_inquiry", "return", "other"],
      default: "product_inquiry",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    message: { type: String, required: true },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  },
);

// High-speed compound index for support helpdesk prioritization
supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
supportTicketSchema.index({ customerId: 1, createdAt: -1 });
supportTicketSchema.index({ createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
