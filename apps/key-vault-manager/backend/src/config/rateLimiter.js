// apps/key-vault-manager/backend/src/config/rateLimiter.js

import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import env from "./env.js";
import { logger } from "./logger.js";
import { redisClient } from "#utils/sessionCache.js";

/**
 * High-performance, infrastructure-agnostic rate limiting factory.
 * Mandates localized MemoryStore for development/tests/fallback,
 * but hot-swaps to Redis store when REDIS_URL and redisClient are active.
 */
export const createRateLimiter = ({ windowMs, max, message, prefix }) => {
  const isTestRun =
    process.env.NODE_ENV === "test" ||
    Boolean(process.env.VITEST) ||
    typeof globalThis.__vitest_worker__ !== "undefined";

  const options = {
    windowMs,
    max: isTestRun ? 99999 : max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: {
      success: false,
      message,
    },
    skip: () => isTestRun,
  };

  // ✅ Connect directly to the exported Redis client instance
  if (env.REDIS_URL && redisClient) {
    options.store = new RedisStore({
      // ioredis sendCommand signature: client.call(command, ...args)
      sendCommand: (command, ...args) => redisClient.call(command, ...args),
      prefix: `rl:${prefix}:`,
    });

    logger.info({
      msg: "📡 Rate limiter linked to Redis cluster store",
      prefix: `rl:${prefix}:`,
      redisConnected: true,
    });
  } else {
    logger.info({
      msg: "🧠 Rate limiter falling back to local Express MemoryStore",
      prefix,
      redisConnected: false,
    });
  }

  return rateLimit(options);
};
