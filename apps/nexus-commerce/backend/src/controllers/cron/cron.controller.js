import { runInventoryReconciliation } from "#services/inventoryReconciler.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import env from "#config/env.js";

export const handleInventoryReconciliationCron = asyncHandler(
  async (req, res) => {
    // Standardized strictly on x-cron-secret (M2M authentication)
    const clientSecret = req.headers["x-cron-secret"];
    const expectedSecret = env.CRON_SECRET || "nexus_cron_secure_key_123";

    if (!clientSecret || clientSecret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid info.",
      });
    }

    const result = await runInventoryReconciliation();

    return res.status(200).json({
      success: true,
      message: "Inventory reconciliation completed successfully.",
      timestamp: new Date().toISOString(),
      result,
    });
  },
);
