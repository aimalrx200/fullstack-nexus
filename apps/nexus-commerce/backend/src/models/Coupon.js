import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      default: "percentage",
    },
    discountPercent: {
      type: Number,
      min: [1, "Discount percentage must be at least 1%"],
      max: [100, "Discount percentage cannot exceed 100%"],
      default: 10,
    },
    discountAmountUSD: {
      type: Number,
      min: 0,
      default: 0,
    },
    discountAmountPKR: {
      type: Number,
      min: 0,
      default: 0,
    },
    minOrderAmountUSD: {
      type: Number,
      min: 0,
      default: 0,
    },
    minOrderAmountPKR: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxDiscountUSD: {
      type: Number,
      default: null, // null = no cap
    },
    maxDiscountPKR: {
      type: Number,
      default: null,
    },
    maxUsageTotal: {
      type: Number,
      default: null, // null = unlimited redemptions
    },
    currentUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedBy: [couponUsageSchema],
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null, // null = never expires
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// High-speed compound indexes for fast validation and admin tables
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ isActive: 1, validUntil: 1, createdAt: -1 });

export default mongoose.model("Coupon", couponSchema);
