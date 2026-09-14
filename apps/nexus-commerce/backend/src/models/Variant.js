import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, "SKU identifier is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true, // e.g., "Space Black / 256GB / Titanium"
    },
    attributes: {
      color: { type: String },
      size: { type: String },
      material: { type: String },
    },
    priceOverrideUSD: {
      type: Number,
    },
    priceOverridePKR: {
      type: Number,
    },
    // Real physical stock on hand in warehouse
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to verify variant uniqueness per product
variantSchema.index({
  productId: 1,
  "attributes.color": 1,
  "attributes.size": 1,
});

export default mongoose.model("Variant", variantSchema);
