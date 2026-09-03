// /server/index.js
import app from "./app.js";
import { connectDB } from "./config/db.js";
import env from "./config/env.js";
import { logger } from "./config/logger.js";
import mongoose from "mongoose";
import { initEmailService } from "./services/emailService.js"; // ✅ Updated named import hook align

// 1. Handle Synchronous Critical Failures Immediately
process.on("uncaughtException", (error) => {
  logger.fatal({
    msg: "❌ CRITICAL: Uncaught Exception thrown",
    error: error.stack || error.message || error,
  });
  process.exit(1);
});

let server;

// 2. PARALLEL STARTUP TIMEOUT: Establish infrastructure cleanly before opening ports
Promise.all([connectDB(), initEmailService()]) // ✅ Re-bound to aligned initialization hook
  .then(() => {
    server = app.listen(env.PORT, () => {
      logger.info({
        msg: "🚀 Server startup sequence achieved",
        environment: env.NODE_ENV || "production",
        port: env.PORT,
      });
    });
  })
  .catch((error) => {
    logger.fatal({
      msg: "❌ CRITICAL: Infrastructure handshake failed during startup sequence",
      error: error.stack || error.message || error,
    });
    process.exit(1);
  });

// 3. Handle Asynchronous Failures
process.on("unhandledRejection", (reason, promise) => {
  logger.warn({
    msg: "⚠️ WARNING: Unhandled Promise Rejection detected",
    promise: String(promise),
    reason:
      reason instanceof Error
        ? { message: reason.message, stack: reason.stack }
        : reason,
  });
});

// 4. Unified Orchestrated Graceful Shutdown
const gracefulShutdown = (signal) => {
  logger.info({
    msg: `🛑 Received ${signal}. Starting coordinated graceful shutdown sequence...`,
  });

  if (!server) {
    logger.info({
      msg: "HTTP Server wasn't listening yet. Exiting immediately.",
    });
    process.exit(0);
  }

  server.close(async (err) => {
    if (err) {
      logger.error({
        msg: "Error while closing HTTP server",
        error: err.stack || err,
      });
      process.exit(1);
    }
    logger.info({
      msg: "🏁 Active HTTP connections successfully drained. No longer accepting requests.",
    });

    try {
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.removeAllListeners("disconnected");
        await mongoose.connection.close();
        logger.info({ msg: "📦 Mongoose connection pool cleanly disposed." });
      }

      logger.info({ msg: "👋 Application shutdown completed cleanly." });
      process.exit(0);
    } catch (dbError) {
      logger.error({
        msg: "Error cleaning up database connections during shutdown",
        error: dbError.stack || dbError,
      });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error({
      msg: "🚨 FORCED SHUTDOWN: Active connections took too long to drain (10s timeout enforced).",
    });
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
