import { Order, User, Variant } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  // 1. Core Summary Metrics Aggregation
  const [orderMetrics] = await Order.aggregate([
    {
      $facet: {
        totalStats: [{ $count: "count" }],
        paidStatsUSD: [
          { $match: { paymentStatus: "paid", "pricing.currency": "USD" } },
          {
            $group: {
              _id: null,
              gmv: { $sum: "$pricing.total" },
              avgOrder: { $avg: "$pricing.total" },
            },
          },
        ],
        paidStatsPKR: [
          { $match: { paymentStatus: "paid", "pricing.currency": "PKR" } },
          {
            $group: {
              _id: null,
              gmv: { $sum: "$pricing.total" },
              avgOrder: { $avg: "$pricing.total" },
            },
          },
        ],
      },
    },
  ]);

  // 2. Gateway Distribution Pipeline
  const gatewayDistribution = await Order.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.total" },
      },
    },
  ]);

  // 3. Sales by Fulfillment Status Pipeline
  const fulfillmentDistribution = await Order.aggregate([
    { $group: { _id: "$fulfillmentStatus", count: { $sum: 1 } } },
  ]);

  const totalCustomers = await User.countDocuments({ role: "customer" });
  const lowStockCount = await Variant.countDocuments({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  });

  const gmvUSD = orderMetrics.paidStatsUSD[0]?.gmv || 0;
  const aovUSD = orderMetrics.paidStatsUSD[0]?.avgOrder || 0;
  const gmvPKR = orderMetrics.paidStatsPKR[0]?.gmv || 0;
  const aovPKR = orderMetrics.paidStatsPKR[0]?.avgOrder || 0;

  return res.status(200).json({
    success: true,
    metrics: {
      totalOrders: orderMetrics.totalStats[0]?.count || 0,
      gmvUSD: Math.round(gmvUSD * 100) / 100,
      aovUSD: Math.round(aovUSD * 100) / 100,
      gmvPKR: Math.round(gmvPKR),
      aovPKR: Math.round(aovPKR),
      totalCustomers,
      lowStockCount,
    },
    charts: {
      gatewayDistribution,
      fulfillmentDistribution,
    },
  });
});
