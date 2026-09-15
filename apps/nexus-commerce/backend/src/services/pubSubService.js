import { EventEmitter } from "events";
import { redisClient, isRedisAlive } from "#config/redis.js";
import { logger } from "#config/logger.js";

const localBus = new EventEmitter();
localBus.setMaxListeners(200);

let subClient = null;
const activeSubscriptions = new Map(); // channelName -> Set of callback functions

const initRedisSubscriber = () => {
  if (subClient || !isRedisAlive() || !redisClient) return;

  try {
    subClient = redisClient.duplicate();

    subClient.on("message", (channel, message) => {
      try {
        const parsed = JSON.parse(message);
        const callbacks = activeSubscriptions.get(channel);
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(parsed);
            } catch (cbErr) {
              logger.error({
                msg: "PubSub callback error",
                error: cbErr.message,
                channel,
              });
            }
          });
        }
      } catch (err) {
        logger.error({
          msg: "PubSub JSON parse error",
          error: err.message,
          channel,
        });
      }
    });

    subClient.on("error", (err) => {
      logger.warn({
        msg: "Redis PubSub subscriber socket notice",
        error: err.message,
      });
    });

    logger.info({ msg: "⚡ Redis PubSub subscriber client initialized" });
  } catch (err) {
    logger.error({
      msg: "Failed to initialize Redis Subscriber",
      error: err.message,
    });
    subClient = null;
  }
};

/**
 * Publishes an event to a channel across Redis Pub/Sub and the local memory bus.
 */
export const publishEvent = async (channel, data) => {
  const payloadString = JSON.stringify(data);

  // 1. Emit on local memory bus
  localBus.emit(channel, data);

  // 2. Publish to distributed Redis Pub/Sub if available
  if (isRedisAlive() && redisClient) {
    try {
      await redisClient.publish(channel, payloadString);
    } catch (err) {
      logger.warn({
        msg: "Redis publish failed, message handled locally",
        error: err.message,
        channel,
      });
    }
  }
};

/**
 * Subscribes a listener to a specific channel. Returns an unsubscribe function.
 */
export const subscribeToChannel = (channel, callback) => {
  // 1. Bind to local event bus
  localBus.on(channel, callback);

  // 2. Bind to Redis Pub/Sub if available
  if (isRedisAlive() && redisClient) {
    if (!subClient) {
      initRedisSubscriber();
    }

    if (subClient) {
      if (!activeSubscriptions.has(channel)) {
        activeSubscriptions.set(channel, new Set());
        subClient.subscribe(channel).catch((err) => {
          logger.error({
            msg: "Redis channel subscription error",
            channel,
            error: err.message,
          });
        });
      }
      activeSubscriptions.get(channel).add(callback);
    }
  }

  // Return unsubscribe handler for SSE cleanup
  return () => {
    localBus.off(channel, callback);

    if (subClient && activeSubscriptions.has(channel)) {
      const set = activeSubscriptions.get(channel);
      set.delete(callback);

      if (set.size === 0) {
        activeSubscriptions.delete(channel);
        subClient.unsubscribe(channel).catch(() => {});
      }
    }
  };
};
