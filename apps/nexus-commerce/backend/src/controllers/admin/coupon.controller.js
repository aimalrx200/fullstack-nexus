import { Coupon } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * Server-Side Paginated Coupon Directory
 * GET /api/v1/admin/coupons
 */
export const getCoupons = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
  const skip = (page - 1) * limit;

  const { search, status } = req.query;
  const query = {};

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  if (search && search.trim()) {
    query.$or = [
      { code: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [coupons, totalCount] = await Promise.all([
    Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    coupons,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});

/**
 * Create a new promotional coupon
 * POST /api/v1/admin/coupons
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `Coupon code '${req.body.code}' already exists.`,
    });
  }

  const coupon = await Coupon.create(req.body);

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon.code} created successfully.`,
    coupon,
  });
});

/**
 * Update an existing coupon
 * PATCH /api/v1/admin/coupons/:couponId
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found." });
  }

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} updated successfully.`,
    coupon,
  });
});

/**
 * Delete a coupon
 * DELETE /api/v1/admin/coupons/:couponId
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    return res
      .status(404)
      .json({ success: false, message: "Coupon not found." });
  }

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} deleted successfully.`,
  });
});
