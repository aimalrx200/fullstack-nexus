import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
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
  sku: { type: String, required: true },
  title: { type: String, required: true },
  variantTitle: { type: String },
  image: { type: String },
  unitPriceUSD: { type: Number, required: true },
  unitPricePKR: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalUSD: { type: Number, required: true },
  totalPKR: { type: Number, required: true },
});

const orderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
  triggeredBy: { type: String, default: "system" },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],

    shippingAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      countryCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    pricing: {
      currency: { type: String, enum: ["USD", "PKR"], default: "USD" },
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, required: true, default: 0 },
      tax: { type: Number, required: true, default: 0 },
      discount: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        "unfulfilled",
        "confirmed",
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "unfulfilled",
      index: true,
    },

    courier: {
      carrier: {
        type: String,
        enum: ["TCS", "DHL", "Trax", "Leopards", "FedEx", "Standard"],
        default: "Standard",
      },
      trackingNumber: { type: String },
      dispatchDate: { type: Date },
      estimatedDelivery: { type: Date },
      currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        label: { type: String },
      },
    },

    timeline: [orderTimelineSchema],
  },
  {
    timestamps: true,
  },
);

// High-speed compound indexes for customer lookups and admin pipelines
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
