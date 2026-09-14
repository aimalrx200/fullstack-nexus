import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String }, // Cloudinary asset identifier
  alt: { type: String, default: "Product Image" },
  isPrimary: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [{ type: String, index: true }],
    images: [productImageSchema],
    basePriceUSD: {
      type: Number,
      required: true,
      min: [0, "Base price cannot be negative"],
    },
    basePricePKR: {
      type: Number,
      required: true,
      min: [0, "Base price cannot be negative"],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// High-relevance weighted compound text search index
productSchema.index(
  { title: "text", tags: "text", description: "text" },
  {
    weights: { title: 10, tags: 5, description: 1 },
    default_language: "english",
    name: "ProductCatalogTextIndex",
  },
);

export default mongoose.model("Product", productSchema);
