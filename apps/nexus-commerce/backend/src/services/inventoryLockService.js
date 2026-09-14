import mongoose from "mongoose";
import { cacheStore, redisClient, isRedisAlive } from "#config/redis.js";
import { Variant, InventoryHold } from "#models/index.js";
import { INVENTORY_HOLD_TTL_SECONDS } from "#config/time.constants.js";
import { logger } from "#config/logger.js";
import { broadcastStockDrop } from "#websockets/wsBroadcaster.js";

// Atomic Lua Script: Evaluates physical stock against active holds in Redis
const ACQUIRE_HOLD_LUA = `
  local stockKey = KEYS[1]
  local holdKey = KEYS[2]
  local requestedQty = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])

  local currentStock = tonumber(redis.call('GET', stockKey) or '-1')
  local currentHolds = tonumber(redis.call('GET', holdKey) or '0')

  if currentStock == -1 then
    return -1
  end

  if (currentStock - currentHolds) >= requestedQty then
    redis.call('INCRBY', holdKey, requestedQty)
    redis.call('EXPIRE', holdKey, ttl)
    return 1
  else
    return 0
  end
`;

// Atomic Lua Script: Safely decrements holds and floors at 0 (prevents negative holds)
const RELEASE_HOLD_LUA = `
  local holdKey = KEYS[1]
  local qtyToRelease = tonumber(ARGV[1])
  local currentHolds = tonumber(redis.call('GET', holdKey) or '0')

  if currentHolds <= qtyToRelease then
    redis.call('SET', holdKey, 0)
    return 0
  else
    local newHolds = redis.call('DECRBY', holdKey, qtyToRelease)
    return newHolds
  end
`;

export const acquireInventoryHold = async ({
  variantId,
  sessionId,
  cartId,
  quantity,
}) => {
  const variant = await Variant.findById(variantId);
  if (!variant) throw new Error("Product variant does not exist.");

  const stockKey = `stock:${variantId}`;
  const holdKey = `holds:${variantId}`;
  let lockAcquired = false;

  if (isRedisAlive()) {
    try {
      // Ensure Redis knows current physical stock
      await cacheStore.setex(
        stockKey,
        INVENTORY_HOLD_TTL_SECONDS * 2,
        String(variant.stock),
      );

      const result = await redisClient.eval(
        ACQUIRE_HOLD_LUA,
        2,
        stockKey,
        holdKey,
        quantity,
        INVENTORY_HOLD_TTL_SECONDS,
      );

      if (result === 1) {
        lockAcquired = true;
      }
    } catch (redisErr) {
      logger.warn({
        msg: "Redis Lua stock hold evaluation failed, executing Mongo OCC fallback",
        error: redisErr.message,
      });
    }
  }

  // MongoDB Concurrency Fallback (if Redis is offline or stock not cached)
  if (!lockAcquired) {
    const activeHolds = await InventoryHold.aggregate([
      { $match: { variantId: variant._id } },
      { $group: { _id: null, totalHeld: { $sum: "$quantity" } } },
    ]);
    const totalHeld = activeHolds[0]?.totalHeld || 0;

    if (variant.stock - totalHeld < quantity) {
      return {
        success: false,
        message: `Insufficient inventory: Only ${Math.max(0, variant.stock - totalHeld)} units remaining.`,
      };
    }
  }

  // Persist TTL hold record
  const holdDoc = await InventoryHold.create({
    variantId: variant._id,
    sessionId,
    cartId,
    quantity,
  });

  return {
    success: true,
    holdId: holdDoc._id,
    expiresAt: new Date(Date.now() + INVENTORY_HOLD_TTL_SECONDS * 1000),
  };
};

export const releaseInventoryHold = async (sessionId, cartId) => {
  const query = {
    $or: [{ ...(sessionId && { sessionId }) }, { ...(cartId && { cartId }) }],
  };
  const holds = await InventoryHold.find(query);
  if (holds.length === 0) return;

  for (const hold of holds) {
    if (isRedisAlive()) {
      try {
        await redisClient.eval(
          RELEASE_HOLD_LUA,
          1,
          `holds:${hold.variantId}`,
          hold.quantity,
        );
      } catch (err) {
        logger.error({
          msg: "Failed to safely decrement Redis hold counter via Lua",
          error: err.message,
        });
      }
    }
  }

  await InventoryHold.deleteMany(query);
};

/**
 * Commits stock deduction atomically across all line items using MongoDB Transactions.
 * Reverts all item updates if any item fails due to insufficient stock.
 */
export const commitInventoryDeduction = async (cartItems, cartId) => {
  const session = await mongoose.startSession();
  const updatedVariants = [];

  try {
    await session.withTransaction(async () => {
      for (const item of cartItems) {
        const variantId = item.variantId?._id || item.variantId;
        const quantity = item.quantity;

        // Atomic OCC condition: stock must be >= required quantity
        const updated = await Variant.findOneAndUpdate(
          { _id: variantId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session },
        );

        if (!updated) {
          throw new Error(
            `Insufficient physical inventory to commit variant ${variantId}. Transaction aborted.`,
          );
        }

        updatedVariants.push(updated);
      }

      // Clear any hold records attached to this checkout session/cart
      if (cartId) {
        await InventoryHold.deleteMany({ cartId }, { session });
      }
    });

    // Invalidate Redis caches and broadcast real-time stock drops
    for (const v of updatedVariants) {
      if (isRedisAlive()) {
        await cacheStore.del(`stock:${v._id}`);
        await cacheStore.del(`holds:${v._id}`);
      }
      broadcastStockDrop(v.productId, v._id, v.stock);
    }

    logger.info({
      msg: "✅ Atomic inventory deduction committed successfully",
      itemCount: cartItems.length,
    });
  } catch (err) {
    logger.error({
      msg: "❌ Atomic inventory deduction transaction failed and rolled back",
      error: err.message,
    });
    throw err;
  } finally {
    await session.endSession();
  }
};
