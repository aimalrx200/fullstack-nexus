import { redisClient, isRedisAlive } from "#config/redis.js";
import { logger } from "#config/logger.js";
import {
  sendOrderReceiptEmail,
  sendSupportTicketEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "./emailService.js";

export const JOB_TYPES = {
  SEND_ORDER_RECEIPT: "SEND_ORDER_RECEIPT",
  SEND_TICKET_EMAIL: "SEND_TICKET_EMAIL",
  SEND_PASSWORD_RESET: "SEND_PASSWORD_RESET",
  SEND_EMAIL_VERIFICATION: "SEND_EMAIL_VERIFICATION",
};

const JOB_HANDLERS = {
  [JOB_TYPES.SEND_ORDER_RECEIPT]: async (payload) => {
    await sendOrderReceiptEmail(payload);
  },
  [JOB_TYPES.SEND_TICKET_EMAIL]: async (payload) => {
    await sendSupportTicketEmail(payload);
  },
  [JOB_TYPES.SEND_PASSWORD_RESET]: async (payload) => {
    await sendPasswordResetEmail(payload);
  },
  [JOB_TYPES.SEND_EMAIL_VERIFICATION]: async (payload) => {
    await sendEmailVerificationEmail(payload);
  },
};

// In-memory fallback queue if Redis is not connected
const localQueue = [];
let isProcessing = false;
let workerInterval = null;
const QUEUE_KEY = "queue:nexus:tasks";

/**
 * Serverless-compatible Job Enqueuer:
 * If running on Vercel (Serverless / No active worker), it executes the handler directly.
 */
export const enqueueJob = async (type, payload, { maxRetries = 3 } = {}) => {
  const handler = JOB_HANDLERS[type];

  if (!handler) {
    logger.error({ msg: "No handler registered for job type", type });
    return null;
  }

  // If in Serverless / Vercel: execute directly so it finishes before lambda exits
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    try {
      await handler(payload);
      logger.info({ msg: "✅ Serverless task executed directly", type });
      return "serverless_direct_ok";
    } catch (err) {
      logger.error({
        msg: "❌ Direct task execution error",
        type,
        error: err.message,
      });
      return null;
    }
  }

  // Local development / long-running mode (uses in-memory or Redis queue)
  const job = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    attempts: 0,
    maxRetries,
    createdAt: new Date().toISOString(),
  };

  try {
    if (isRedisAlive() && redisClient) {
      await redisClient.lpush("queue:nexus:tasks", JSON.stringify(job));
    }
    // Also trigger immediate processing
    await handler(payload);
  } catch (err) {
    logger.error({ msg: "Task execution fallback error", error: err.message });
  }

  return job.id;
};

/**
 * Processes a single job with error handling and retry mechanism.
 */
const processSingleJob = async (job) => {
  const handler = JOB_HANDLERS[job.type];
  if (!handler) {
    logger.error({ msg: "No handler registered for job type", type: job.type });
    return;
  }

  try {
    job.attempts += 1;
    await handler(job.payload);
    logger.info({
      msg: "✅ Background job completed successfully",
      jobId: job.id,
      type: job.type,
      attempts: job.attempts,
    });
  } catch (err) {
    logger.error({
      msg: "❌ Background job execution failed",
      jobId: job.id,
      type: job.type,
      attempt: job.attempts,
      error: err.message,
    });

    if (job.attempts < job.maxRetries) {
      // Re-enqueue for retry
      setTimeout(() => {
        if (isRedisAlive() && redisClient) {
          redisClient.lpush(QUEUE_KEY, JSON.stringify(job)).catch(() => {});
        } else {
          localQueue.push(job);
        }
      }, 3000 * job.attempts); // Exponential retry delay (3s, 6s, 9s)
    } else {
      logger.error({
        msg: "🚨 Job exceeded max retry limit. Moving to dead-letter log.",
        jobId: job.id,
        type: job.type,
      });
    }
  }
};

/**
 * Worker tick: pops and processes jobs from Redis or in-memory queue.
 */
export const processQueueTick = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    let rawJob = null;

    if (isRedisAlive() && redisClient) {
      try {
        rawJob = await redisClient.rpop(QUEUE_KEY);
      } catch (err) {
        logger.error({ msg: "Redis RPOP error", error: err.message });
      }
    }

    if (rawJob) {
      const job = JSON.parse(rawJob);
      await processSingleJob(job);
    } else if (localQueue.length > 0) {
      const job = localQueue.shift();
      if (job) {
        await processSingleJob(job);
      }
    }
  } catch (err) {
    logger.error({ msg: "Queue worker loop exception", error: err.message });
  } finally {
    isProcessing = false;
  }
};

/**
 * Starts the continuous background queue worker.
 */
export const startJobQueueWorker = (pollIntervalMs = 1500) => {
  if (workerInterval) {
    clearInterval(workerInterval);
  }

  workerInterval = setInterval(() => {
    processQueueTick().catch(() => {});
  }, pollIntervalMs);

  logger.info({
    msg: "⚡ Async background task worker running",
    pollIntervalMs,
  });
};

export const stopJobQueueWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
};
