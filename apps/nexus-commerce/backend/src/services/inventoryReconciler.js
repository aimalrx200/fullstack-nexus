import { Variant, InventoryHold } from "#models/index.js";
import { cacheStore, redisClient, isRedisAlive } from "#config/redis.js";
import { INVENTORY_HOLD_TTL_SECONDS } from "#config/time.constants.js";
import { broadcastStockDrop } from "#websockets/wsBroadcaster.js";
import { logger } from "#config/logger.js";

let reconciliationTimer = null;

/**
 * Reconciles inventory holds between MongoDB and Redis.
 * Cleans up orphaned holds and restores true available stock.
 */
export const runInventoryReconciliation = async () => {
  try {
    const expirationThreshold = new Date(
      Date.now() - INVENTORY_HOLD_TTL_SECONDS * 1000,
    );

    // 1. Purge any stale hold records that bypassed MongoDB TTL
    const expiredResult = await InventoryHold.deleteMany({
      createdAt: { $lt: expirationThreshold },
    });

    if (expiredResult.deletedCount > 0) {
      logger.info({
        msg: "🧹 Cleaned up expired inventory holds",
        count: expiredResult.deletedCount,
      });
    }

    // 2. Aggregate active holds per variant
    const activeHolds = await InventoryHold.aggregate([
      { $group: { _id: "$variantId", totalHeld: { $sum: "$quantity" } } },
    ]);

    const activeHoldsMap = new Map();
    for (const hold of activeHolds) {
      activeHoldsMap.set(hold._id.toString(), hold.totalHeld);
    }

    // 3. Fetch all active variants to resynchronize cache state
    const variants = await Variant.find({})
      .select("_id stock productId")
      .lean();

    for (const variant of variants) {
      const variantIdStr = variant._id.toString();
      const currentHeld = activeHoldsMap.get(variantIdStr) || 0;
      const actualAvailable = Math.max(0, variant.stock - currentHeld);

      if (isRedisAlive() && redisClient) {
        // Sync Redis ground truth
        await cacheStore.setex(
          `stock:${variantIdStr}`,
          INVENTORY_HOLD_TTL_SECONDS * 2,
          String(variant.stock),
        );
        await cacheStore.setex(
          `holds:${variantIdStr}`,
          INVENTORY_HOLD_TTL_SECONDS * 2,
          String(currentHeld),
        );
      }

      // Broadcast live stock to storefront in case stuck holds were freed
      broadcastStockDrop(variant.productId, variant._id, actualAvailable);
    }

    logger.debug({
      msg: "⚡ Inventory hold reconciliation completed",
      scannedVariants: variants.length,
      activeHoldsCount: activeHolds.length,
    });
  } catch (err) {
    logger.error({
      msg: "Inventory reconciliation worker error",
      error: err.message,
    });
  }
};

/**
 * Starts the automated inventory reconciliation worker loop.
 * Runs every 5 minutes (300,000 ms).
 */
export const startInventoryReconciliationWorker = (intervalMs = 300000) => {
  if (reconciliationTimer) {
    clearInterval(reconciliationTimer);
  }

  // Initial pass on boot
  runInventoryReconciliation().catch(() => {});

  reconciliationTimer = setInterval(() => {
    runInventoryReconciliation().catch(() => {});
  }, intervalMs);

  logger.info({
    msg: "🔄 Inventory hold self-healing reconciliation worker started",
    intervalSeconds: intervalMs / 1000,
  });
};

export const stopInventoryReconciliationWorker = () => {
  if (reconciliationTimer) {
    clearInterval(reconciliationTimer);
    reconciliationTimer = null;
  }
};
