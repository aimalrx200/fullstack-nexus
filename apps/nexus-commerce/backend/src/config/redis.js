import Redis from "ioredis";
import { LRUCache } from "lru-cache";
import env from "./env.js";
import { logger } from "./logger.js";

const localCache = new LRUCache({
  max: env.NODE_ENV === "production" ? 10000 : 1000,
  ttlAutopurge: true,
  dispose: (value, key, reason) => {
    logger.debug({ msg: "Local LRU key evicted", key, reason });
  },
});

export let redisClient = null;
let usingFallback = false;

if (env.REDIS_URL && env.NODE_ENV !== "test") {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        if (times > 5) {
          if (!usingFallback) {
            usingFallback = true;
            logger.warn({
              msg: "⚠️ Redis connection exceeded max retries. Using local LRU memory fallback.",
            });
          }
          return null;
        }
        return Math.min(times * 200, 3000);
      },
    });

    redisClient.on("ready", () => {
      usingFallback = false;
      logger.info({
        msg: "⚡ Upstash Redis connected (Stock Lock & Cache Layer ready)",
      });
    });

    redisClient.on("error", (err) => {
      if (!usingFallback) {
        usingFallback = true;
        logger.warn({
          msg: "⚠️ Redis socket issue — dropping to LRU memory fallback",
          error: err.message,
        });
      }
    });
  } catch (err) {
    logger.error({
      msg: "Failed to initialize Redis pool",
      error: err.message,
    });
    redisClient = null;
  }
}

export function isRedisAlive() {
  return Boolean(redisClient && redisClient.status === "ready");
}

export const cacheStore = {
  get: async (key) => {
    if (isRedisAlive()) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        logger.error({ msg: "Redis GET exception", error: err.message });
      }
    }
    return localCache.get(key) ?? null;
  },

  setex: async (key, ttlSeconds, value) => {
    const str = String(value);
    localCache.set(key, str, { ttl: ttlSeconds * 1000 });

    if (isRedisAlive()) {
      try {
        await redisClient.setex(key, ttlSeconds, str);
      } catch (err) {
        logger.error({ msg: "Redis SETEX exception", error: err.message });
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
        logger.error({ msg: "Redis DEL exception", error: err.message });
      }
    }
    return true;
  },

  getStatus: () => ({
    backend: isRedisAlive() ? "redis" : "local-lru-fallback",
    redisStatus: redisClient?.status ?? "uninitialized",
    localCacheSize: localCache.size,
  }),
};
