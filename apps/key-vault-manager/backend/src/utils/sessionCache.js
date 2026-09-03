// apps/key-vault-manager/backend/src/utils/sessionCache.js

import Redis from "ioredis";
import { LRUCache } from "lru-cache";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const IS_PROD = env.NODE_ENV === "production";

// 🧼 Clean LRU initialization using memory boundaries
const localCache = new LRUCache({
  max: IS_PROD ? 5000 : 500,
  updateAgeOnGet: false,
  ttlAutopurge: true,

  dispose: (value, key, reason) => {
    logger.info({
      msg: `🧹 [Cache Telemetry] Local Key Eviction Notice`,
      key,
      cachedVersion: value,
      evictionReason: reason,
      timestamp: new Date().toISOString(),
    });
  },
});

export let redisClient = null;
let usingFallback = false;

if (!env.REDIS_URL && IS_PROD) {
  logger.warn({
    msg: "⚠️ Sessions falling back to local memory store. Active nodes cannot scale horizontally without data isolation issues.",
    redisConnected: false,
    environment: env.NODE_ENV,
  });
}

if (env.REDIS_URL && env.NODE_ENV !== "test") {
  const MAX_RETRIES = 3;

  try {
    redisClient = new Redis(env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: MAX_RETRIES,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        if (!IS_PROD && times >= MAX_RETRIES) {
          logger.error({
            msg: "❌ Redis failed connection thresholds. Falling back to local in-memory store.",
            totalAttempts: times,
            maxAllowedRetries: MAX_RETRIES,
          });
          return null;
        }
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
    });

    redisClient.on("ready", () => {
      usingFallback = false;
      logger.info({
        msg: "✅ Central Redis cache connection established/restored.",
      });
    });

    redisClient.on("error", (err) => {
      if (!usingFallback) {
        usingFallback = true;
        logger.error({
          msg: "⚠️ Redis socket issue — dropping down to LRU memory fallback layer.",
          error: err.message,
        });
      }
    });
  } catch (err) {
    logger.fatal({
      msg: "❌ Failed to initialize Redis network client pool structure",
      error: err.message,
    });
    redisClient = null;
  }
}

export function isRedisAlive() {
  return Boolean(redisClient && redisClient.status === "ready");
}

export const sessionCache = {
  get: async (key) => {
    if (isRedisAlive()) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        logger.error({
          msg: "Redis GET error execution path",
          error: err.message,
        });
      }
    }
    return localCache.get(key) ?? null;
  },

  setex: async (key, ttlSeconds, value) => {
    const str = String(value);
    const now = new Date();
    const calculatedExpiry = new Date(now.getTime() + ttlSeconds * 1000);

    logger.debug({
      msg: "[Cache Telemetry] Sliding Window Advance Request",
      key,
      trackingVersion: value,
      eventTime: now.toISOString(),
      expectedEviction: calculatedExpiry.toISOString(),
      ttlSeconds,
    });

    localCache.set(key, str, { ttl: ttlSeconds * 1000 });

    if (isRedisAlive()) {
      try {
        await redisClient.setex(key, ttlSeconds, str);
      } catch (err) {
        logger.error({
          msg: "Redis SETEX error execution path",
          error: err.message,
        });
      }
    }
    return "OK";
  },

  del: async (key) => {
    localCache.delete(key);
    if (isRedisAlive()) {
      try {
        await redisClient.del(key);
      } catch (err) {
        logger.error({
          msg: "Redis DEL error execution path",
          error: err.message,
        });
      }
    }
    return true;
  },

  flushall: async () => {
    localCache.clear();
    if (isRedisAlive()) {
      try {
        await redisClient.flushall();
      } catch (err) {
        logger.error({
          msg: "Redis FLUSHALL error execution path",
          error: err.message,
        });
      }
    }
    return "OK";
  },

  getStatus: () => ({
    backend: isRedisAlive() ? "redis" : "localCache (LRU fallback)",
    redisStatus: redisClient?.status ?? "not initialized",
    localCacheSize: localCache.size,
  }),
};
