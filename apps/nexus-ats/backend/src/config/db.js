import mongoose from "mongoose";
import { env } from "#config/env.js";
import { logger } from "#config/logger.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    logger.debug("MongoDB connection reused from active cache.");
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.NODE_ENV === "development",
    });

    isConnected = conn.connections[0].readyState === 1;
    logger.info(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error({ err: error.message }, "❌ MongoDB connection failed");
    if (env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  logger.warn("⚠️ MongoDB disconnected");
});
