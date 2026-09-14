import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * Server-Side Paginated Customer Directory with Database-Computed LTV
 */
export const getCustomerDirectory = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim();

  const matchStage = { role: "customer" };
  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [result] = await User.aggregate([
    { $match: matchStage },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        customers: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "orders",
              localField: "_id",
              foreignField: "userId",
              as: "userOrders",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              role: 1,
              createdAt: 1,
              addresses: 1,
              passkeysCount: { $size: { $ifNull: ["$passkeys", []] } },
              orderCount: { $size: "$userOrders" },
              ltvUSD: {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$userOrders",
                        as: "order",
                        cond: {
                          $and: [
                            { $eq: ["$$order.paymentStatus", "paid"] },
                            { $eq: ["$$order.pricing.currency", "USD"] },
                          ],
                        },
                      },
                    },
                    as: "paidOrder",
                    in: "$$paidOrder.pricing.total",
                  },
                },
              },
              ltvPKR: {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$userOrders",
                        as: "order",
                        cond: {
                          $and: [
                            { $eq: ["$$order.paymentStatus", "paid"] },
                            { $eq: ["$$order.pricing.currency", "PKR"] },
                          ],
                        },
                      },
                    },
                    as: "paidOrder",
                    in: "$$paidOrder.pricing.total",
                  },
                },
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
    customers: result.customers,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});
