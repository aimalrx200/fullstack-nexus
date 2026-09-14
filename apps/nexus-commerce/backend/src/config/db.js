import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "./logger.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      autoIndex: env.NODE_ENV !== "production", // Auto-index in dev; disable in production for speed
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Attach connection state listeners once
    mongoose.connection.on("error", (err) => {
      logger.error({ msg: "MongoDB connection error", error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn({ msg: "MongoDB connection disconnected" });
    });

    cached.promise = mongoose.connect(env.MONGO_URI, opts).then((inst) => {
      logger.info({ msg: "🛍️ Commerce MongoDB connected successfully" });
      return inst;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    logger.error({ msg: "❌ MongoDB connection failed", error: error.message });
    throw error;
  }

  return cached.conn;
};
