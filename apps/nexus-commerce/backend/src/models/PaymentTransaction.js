import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa", "cod"],
      required: true,
      index: true,
    },
    gatewayTransactionId: {
      type: String,
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "PKR"],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated",
      index: true,
    },
    rawGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// High-speed compound indexes for admin ledger audits
paymentTransactionSchema.index({ gateway: 1, status: 1, createdAt: -1 });
paymentTransactionSchema.index({ orderNumber: 1, createdAt: -1 });
paymentTransactionSchema.index({ createdAt: -1 });

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
