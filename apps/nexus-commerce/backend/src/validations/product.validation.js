import { z } from "zod";

// Helper: Safely transforms comma-separated tag strings or stringified JSON into arrays
const transformTags = (val) => {
  if (Array.isArray(val)) return val.map((t) => String(t).trim());
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim());
    } catch {
      return val
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// 1. Create Product Schema (Type-coerced for Multer multipart form-data)
export const CreateProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Product title must be at least 3 characters.")
      .max(120),
    description: z
      .string()
      .min(10, "Product description must be at least 10 characters."),
    category: z.string().min(2, "Category name is required."),
    tags: z.preprocess(transformTags, z.array(z.string()).default([])),
    basePriceUSD: z.coerce
      .number()
      .positive("Base price in USD must be greater than 0."),
    basePricePKR: z.coerce
      .number()
      .positive("Base price in PKR must be greater than 0."),
    isFeatured: z.preprocess(
      (val) => val === true || val === "true" || val === 1 || val === "1",
      z.boolean().default(false),
    ),
  }),
});

// 2. Update Product Partial Schema
export const UpdateProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
    tags: z.preprocess(transformTags, z.array(z.string())).optional(),
    basePriceUSD: z.coerce.number().positive().optional(),
    basePricePKR: z.coerce.number().positive().optional(),
    isFeatured: z
      .preprocess((val) => val === true || val === "true", z.boolean())
      .optional(),
    isArchived: z
      .preprocess((val) => val === true || val === "true", z.boolean())
      .optional(),
  }),
  params: z.object({
    productId: z.string().min(1, "Product ID is required."),
  }),
});

// 3. Create Variant / SKU Schema
export const CreateVariantSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Parent product ID is required."),
    sku: z
      .string()
      .min(3, "SKU must be at least 3 characters.")
      .toUpperCase()
      .trim(),
    title: z
      .string()
      .min(2, "Variant title is required (e.g. 'Space Gray / 256GB')."),
    attributes: z
      .object({
        color: z.string().optional(),
        size: z.string().optional(),
        material: z.string().optional(),
      })
      .optional(),
    stock: z.coerce.number().int().min(0, "Stock on hand cannot be negative."),
    priceOverrideUSD: z.coerce.number().positive().optional(),
    priceOverridePKR: z.coerce.number().positive().optional(),
    lowStockThreshold: z.coerce.number().int().min(0).default(5),
    image: z.string().url().optional(),
  }),
});

// 4. Update Variant Stock Override Schema
export const UpdateStockOverrideSchema = z.object({
  body: z.object({
    stock: z.coerce.number().int().min(0, "Physical stock cannot be negative."),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
  }),
  params: z.object({
    variantId: z.string().min(1, "Variant ID is required."),
  }),
});
