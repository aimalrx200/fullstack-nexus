// /src/config/db.js

import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "./logger.js"; // Import your centralized Pino instance

let connectionRetries = 0;
const MAX_RETRIES = 5;
const INITIAL_RETRY_INTERVAL_MS = 2000;

export const connectDB = async () => {
  // Production optimization options
  const mongooseOptions = {
    autoIndex: env.NODE_ENV !== "production", // Overhead reduction: avoid automatic index builds in production
    maxPoolSize: 10, // Maintain a stable pool of connections (adjust based on load)
    serverSelectionTimeoutMS: 10000, // Fast fail during cluster selection (don't hang indefinitely)
    socketTimeoutMS: 45000, // Close inactive sockets after 45 seconds
  };

  try {
    await mongoose.connect(env.MONGO_URI, mongooseOptions);
    logger.info({ msg: "💚 MongoDB connected successfully!" });
    connectionRetries = 0; // Reset retries on a successful connection
  } catch (error) {
    connectionRetries++;

    logger.error({
      msg: `❌ MongoDB connection failed (Attempt ${connectionRetries}/${MAX_RETRIES})`,
      error: error.stack || error.message || error,
    });

    if (connectionRetries < MAX_RETRIES) {
      // Exponential backoff: 2s, 4s, 8s, 16s...
      const delay =
        INITIAL_RETRY_INTERVAL_MS * Math.pow(2, connectionRetries - 1);

      logger.info({
        msg: `Retrying database handshake`,
        delaySeconds: delay / 1000,
        nextAttempt: connectionRetries + 1,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB();
    }

    // Bubble the error up to index.js so it handles the crash orchestrating sequence
    throw new Error("Catastrophic database connection failure limit reached.", {
      cause: error,
    });
  }
};

// =============================================================================
// RUNTIME HEALTH TELEMETRY
// =============================================================================

mongoose.connection.on("error", (err) => {
  logger.error({
    msg: "⚠️ MongoDB runtime connection error occurred",
    error: err.stack || err.message || err,
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn({
    msg: "⚠️ MongoDB lost connection. Driver attempting automatic reconnection...",
  });
});
