import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { closeRedisConnection } from "./config/redis.js";
import { initEmailService } from "./services/emailService.js";
import { initWebSocketServer } from "./websockets/wsServer.js";
import {
  startInventoryReconciliationWorker,
  stopInventoryReconciliationWorker,
} from "./services/inventoryReconciler.js";
import {
  startJobQueueWorker,
  stopJobQueueWorker,
} from "./services/jobQueue.js";
import { logger } from "./config/logger.js";

const server = http.createServer(app);

// Initialize WebSockets attached to the HTTP server
const io = initWebSocketServer(server);

// Boot sequence
Promise.all([connectDB(), initEmailService()])
  .then(() => {
    // 1. Start the self-healing inventory reconciliation worker (every 5 mins)
    startInventoryReconciliationWorker(300000);

    // 2. Start the async background task queue worker (polls every 1.5s)
    startJobQueueWorker(1500);

    server.listen(env.PORT, () => {
      logger.info({
        msg: "🚀 Nexus Commerce Backend API, Workers & Socket Engine Live",
        port: env.PORT,
        environment: env.NODE_ENV,
      });
    });
  })
  .catch((err) => {
    logger.fatal({ msg: "Server bootstrap failed", error: err.message });
    process.exit(1);
  });

// =============================================================================
// GRACEFUL PROCESS TERMINATION HANDLER (SIGTERM / SIGINT)
// =============================================================================
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({
    msg: `🛑 ${signal} signal received: Initiating graceful drain and shutdown`,
  });

  // Force exit safety timeout (10 seconds)
  const forceExitTimer = setTimeout(() => {
    logger.error({
      msg: "⚠️ Graceful shutdown timed out. Forcing process exit.",
    });
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    // 1. Stop background worker timers
    stopJobQueueWorker();
    stopInventoryReconciliationWorker();
    logger.info({ msg: "Background queue & inventory workers halted" });

    // 2. Close active WebSocket connections
    if (io) {
      await new Promise((resolve) => {
        io.close(() => {
          logger.info({ msg: "Socket.io engine closed" });
          resolve();
        });
      });
    }

    // 3. Stop accepting new HTTP requests and drain active requests
    if (server.listening) {
      await new Promise((resolve) => {
        server.close((err) => {
          if (err && err.code !== "ERR_SERVER_NOT_RUNNING") {
            logger.error({
              msg: "HTTP server close error",
              error: err.message,
            });
          } else {
            logger.info({ msg: "HTTP server closed and connections drained" });
          }
          resolve();
        });
      });
    } else {
      logger.info({ msg: "HTTP server closed and connections drained" });
    }

    // 4. Disconnect Redis client
    await closeRedisConnection();

    // 5. Close MongoDB connection pool
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      logger.info({ msg: "MongoDB connection pool closed" });
    }

    logger.info({
      msg: "✅ Nexus Commerce Engine shutdown complete. Goodbye!",
    });
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (err) {
    logger.error({
      msg: "Error encountered during graceful shutdown",
      error: err.message,
    });
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Uncaught exception and unhandled rejection guards
process.on("uncaughtException", (err) => {
  logger.fatal({
    msg: "💥 Uncaught Exception detected",
    error: err.message,
    stack: err.stack,
  });
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({
    msg: "💥 Unhandled Promise Rejection detected",
    reason: String(reason),
  });
  gracefulShutdown("UNHANDLED_REJECTION");
});
