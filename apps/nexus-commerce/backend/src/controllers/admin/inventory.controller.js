import { Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { broadcastStockDrop } from "#websockets/wsBroadcaster.js";
import { cacheStore } from "#config/redis.js";

/**
 * Server-Side Paginated Inventory Matrix with Database-Level Hold Joins
 */
export const getInventoryMatrix = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const { search, isLowStockOnly } = req.query;
  const matchStage = {};

  if (search && search.trim()) {
    matchStage.$or = [
      { sku: { $regex: search.trim(), $options: "i" } },
      { title: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [result] = await Variant.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "inventoryholds",
        localField: "_id",
        foreignField: "variantId",
        as: "holds",
      },
    },
    {
      $addFields: {
        activeHolds: { $sum: "$holds.quantity" },
      },
    },
    {
      $addFields: {
        availableStock: {
          $max: [0, { $subtract: ["$stock", "$activeHolds"] }],
        },
      },
    },
    ...(isLowStockOnly === "true"
      ? [
          {
            $match: {
              $expr: { $lte: ["$availableStock", "$lowStockThreshold"] },
            },
          },
        ]
      : []),
    {
      $facet: {
        metadata: [{ $count: "total" }],
        inventory: [
          { $sort: { stock: 1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              variantId: "$_id",
              productTitle: { $ifNull: ["$product.title", "Master Product"] },
              category: { $ifNull: ["$product.category", "General"] },
              sku: 1,
              title: 1,
              physicalStock: "$stock",
              activeHolds: 1,
              availableStock: 1,
              lowStockThreshold: 1,
              isLowStock: { $lte: ["$availableStock", "$lowStockThreshold"] },
              priceUSD: "$priceOverrideUSD",
              pricePKR: "$priceOverridePKR",
              image: {
                $ifNull: [
                  "$image",
                  { $arrayElemAt: ["$product.images.url", 0] },
                ],
              },
            },
          },
        ],
      },
    },
  ]);

  const totalCount = result.metadata[0]?.total || 0;

  return res.status(200).json({
    success: true,
    inventory: result.inventory,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});

export const updateStockOverride = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { stock, lowStockThreshold } = req.body;

  const variant = await Variant.findByIdAndUpdate(
    variantId,
    {
      $set: {
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(lowStockThreshold !== undefined && {
          lowStockThreshold: Number(lowStockThreshold),
        }),
      },
    },
    { new: true },
  ).populate("productId");

  if (!variant) {
    return res
      .status(404)
      .json({ success: false, message: "Variant not found." });
  }

  await cacheStore.del(`stock:${variant._id}`);
  broadcastStockDrop(variant.productId._id, variant._id, variant.stock);

  return res.status(200).json({
    success: true,
    message: `Stock updated for SKU: ${variant.sku}`,
    variant,
  });
});

export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStockVariants = await Variant.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .populate("productId", "title category images")
    .limit(20);

  return res
    .status(200)
    .json({ success: true, count: lowStockVariants.length, lowStockVariants });
});
