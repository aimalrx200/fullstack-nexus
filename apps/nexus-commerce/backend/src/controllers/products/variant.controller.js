import { Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const createVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.create(req.body);
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
