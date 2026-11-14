import { getHiringAnalytics } from "#services/analyticsService.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Get aggregated funnel progression, conversion rates, and department velocity
 * @access  Recruiter
 */
export const getOverviewAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getHiringAnalytics();

  res.status(200).json({
    success: true,
    ...analytics,
  });
});
