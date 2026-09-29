// apps/nexus-commerce/backend/src/controllers/products/variant.controller.js

import { Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const createVariant = asyncHandler(async (req, res) => {
  const { sku } = req.body;
  const cleanSku = sku ? sku.trim().toUpperCase() : "";

  // 1. Guard against duplicate SKU before attempting insert
  const existing = await Variant.findOne({ sku: cleanSku });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `Variant SKU "${cleanSku}" already exists in inventory. Please choose a unique SKU.`,
    });
  }

  const variant = await Variant.create({
    ...req.body,
    sku: cleanSku,
  });

  return res.status(201).json({ success: true, variant });
});

export const updateVariantStock = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { stock, priceOverrideUSD, priceOverridePKR } = req.body;

  const variant = await Variant.findByIdAndUpdate(
    variantId,
    { $set: { stock, priceOverrideUSD, priceOverridePKR } },
    { new: true },
  );

  return res.status(200).json({ success: true, variant });
});
