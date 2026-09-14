import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import env from "./env.js";
import { redisClient, isRedisAlive } from "./redis.js";
import { logger } from "./logger.js";

/**
 * Creates a distributed rate limiter with dynamic Redis binding and memory failover.
 */
export const createRateLimiter = ({ windowMs, max, message, prefix }) => {
  const isTest = env.NODE_ENV === "test";

  const options = {
    windowMs,
    max: isTest ? 99999 : max,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true, // Ensures requests don't fail with 500 if Redis is reconnecting
    message: { success: false, message },
    skip: () => isTest,
  };

  // Bind to RedisStore whenever REDIS_URL is configured
  if (env.REDIS_URL && redisClient) {
    try {
      options.store = new RedisStore({
        sendCommand: async (command, ...args) => {
          // Dynamic execution: routes to Redis as soon as connection is ready
          if (!isRedisAlive() || !redisClient) {
            throw new Error("Redis client connection is warming up");
          }
          return redisClient.call(command, ...args);
        },
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
