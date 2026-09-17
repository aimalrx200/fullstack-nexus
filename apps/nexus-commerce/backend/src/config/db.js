import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "./logger.js";

const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const IS_PROD = env.NODE_ENV === "production";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    listenersAttached: false,
  };
}

export const connectDB = async () => {
  // 1. Fast-path: return active ready connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If disconnected or in an errored state, discard stale promise/connection
  if (
    cached.conn &&
    mongoose.connection.readyState !== 1 &&
    mongoose.connection.readyState !== 2
  ) {
    logger.warn({
      msg: "MongoDB connection is stale or disconnected. Resetting cache.",
      readyState: mongoose.connection.readyState,
    });
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      // In serverless, disable bufferCommands so failures fail fast without memory queuing
      bufferCommands: !IS_SERVERLESS,
      autoIndex: !IS_PROD, // Auto-index only in local dev
      // Serverless lambdas need minimal pools (1-2) to avoid exhausting MongoDB Atlas connection limits
      maxPoolSize: IS_SERVERLESS ? 2 : IS_PROD ? 10 : 5,
      minPoolSize: IS_SERVERLESS ? 0 : 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    };

    // Attach lifecycle event listeners once across lambda re-use
    if (!cached.listenersAttached) {
      mongoose.connection.on("error", (err) => {
        logger.error({ msg: "MongoDB connection error", error: err.message });
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn({ msg: "MongoDB connection dropped" });
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on("connected", () => {
        logger.info({
          msg: "🛍️ Commerce MongoDB connected successfully",
          mode: IS_SERVERLESS ? "serverless-edge" : "container-persistent",
        });
      });

      cached.listenersAttached = true;
    }

    cached.promise = mongoose
      .connect(env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    logger.error({ msg: "❌ MongoDB connection failed", error: error.message });
    throw error;
  }

  return cached.conn;
};
