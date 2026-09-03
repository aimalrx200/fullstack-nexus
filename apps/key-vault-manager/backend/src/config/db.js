// /apps/key-vault-manager/backend/src/config/db.js

import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "./logger.js";

// Global cache across serverless warm invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse the active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongooseOptions = {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(env.MONGO_URI, mongooseOptions)
      .then((mongooseInstance) => {
        logger.info({ msg: "💚 MongoDB connected successfully!" });
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    logger.error({
      msg: "❌ MongoDB serverless connection failed",
      error: error.message,
    });
    throw error;
  }

  return cached.conn;
};
