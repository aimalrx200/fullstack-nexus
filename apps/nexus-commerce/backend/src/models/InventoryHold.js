import mongoose from "mongoose";
import { INVENTORY_HOLD_TTL_SECONDS } from "#config/time.constants.js";

const inventoryHoldSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

// Native MongoDB TTL index: automatically deletes expired holds after 10 minutes
inventoryHoldSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: INVENTORY_HOLD_TTL_SECONDS },
);

export default mongoose.model("InventoryHold", inventoryHoldSchema);
