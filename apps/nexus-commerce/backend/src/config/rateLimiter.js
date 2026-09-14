import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import env from "./env.js";
import { redisClient } from "./redis.js";
import { logger } from "./logger.js";

/**
 * Creates a distributed rate limiter with Redis store and local memory failover.
 */
export const createRateLimiter = ({ windowMs, max, message, prefix }) => {
  const isTest = env.NODE_ENV === "test";

  const options = {
    windowMs,
    max: isTest ? 99999 : max,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true, // Guarantees requests proceed smoothly even if Redis reconnects
    message: { success: false, message },
    skip: () => isTest,
  };

  // Bind to RedisStore whenever REDIS_URL is configured
  if (env.REDIS_URL && redisClient) {
    try {
      options.store = new RedisStore({
        sendCommand: (command, ...args) => redisClient.call(command, ...args),
        prefix: `rl:nexus:${prefix}:`,
      });
      logger.debug({
        msg: "Distributed rate limiter initialized with Redis store",
        prefix,
      });
    } catch {
      logger.warn({
        msg: "Rate limiter falling back to local memory store",
        prefix,
      });
    }
  }

  return rateLimit(options);
};
