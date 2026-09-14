import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  priceAtAdditionUSD: {
    type: Number,
    required: true,
  },
  priceAtAdditionPKR: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    guestSessionId: {
      type: String,
      sparse: true,
      index: true,
    },
    items: [cartItemSchema],
    appliedCoupon: {
      code: { type: String, uppercase: true },
      discountPercent: { type: Number, default: 0 },
      discountAmountUSD: { type: Number, default: 0 },
      discountAmountPKR: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Cart", cartSchema);
