import { cacheStore } from "#config/redis.js";
import { IDEMPOTENCY_TTL_SECONDS } from "#config/time.constants.js";
import { logger } from "#config/logger.js";

/**
 * Retrieves a cached idempotency record.
 */
export const getIdempotencyRecord = async (idempotencyKey) => {
  if (!idempotencyKey) return null;

  try {
    const raw = await cacheStore.get(`idempotency:${idempotencyKey}`);
    if (!raw) return null;
    if (raw === "PROCESSING") return { status: "PROCESSING" };
    return JSON.parse(raw);
  } catch (err) {
    logger.error({
      msg: "Idempotency cache retrieval error",
      error: err.message,
    });
    return null;
  }
};

/**
 * Atomically persists a completed response payload for a given idempotency key.
 */
export const setIdempotencyRecord = async (
  idempotencyKey,
  responseData,
  ttlSeconds = IDEMPOTENCY_TTL_SECONDS,
) => {
  if (!idempotencyKey) return;

  try {
    await cacheStore.setex(
      `idempotency:${idempotencyKey}`,
      ttlSeconds,
      JSON.stringify(responseData),
    );
  } catch (err) {
    logger.error({
      msg: "Failed to persist idempotency cache record",
      error: err.message,
    });
  }
};

/**
 * Evicts an idempotency key if a transaction fails before completion.
 */
export const removeIdempotencyRecord = async (idempotencyKey) => {
  if (!idempotencyKey) return;
  try {
    await cacheStore.del(`idempotency:${idempotencyKey}`);
  } catch (err) {
    logger.error({
      msg: "Failed to evict idempotency key",
      error: err.message,
    });
  }
};
