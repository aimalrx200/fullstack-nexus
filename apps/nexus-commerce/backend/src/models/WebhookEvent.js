import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true, // Guarantees zero duplicate processing
      index: true,
    },
    gateway: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa"],
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WebhookEvent", webhookEventSchema);
