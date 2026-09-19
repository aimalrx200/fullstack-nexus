import { Router } from "express";
import mongoose from "mongoose";
import { redisClient, isRedisAlive, cacheStore } from "#config/redis.js";

import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminRoutes from "./admin.routes.js";
import supportRoutes from "./support.routes.js";
import streamRoutes from "./stream.routes.js";
import cronRoutes from "./cron.routes.js";
import staffRoutes from "./staff.routes.js";

const router = Router();

// =============================================================================
// 1. ROOT API GATEWAY WELCOME ENDPOINT
// =============================================================================
router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "Nexus Commerce API v1 Gateway",
    status: "online",
    healthCheck: "/api/v1/health",
    version: "1.0.0",
  });
});

// =============================================================================
// 2. HEALTH & TELEMETRY MONITORING ENDPOINTS
// =============================================================================

/**
 * Liveness Probe: Quick check that the Node process is running.
 */
router.get("/health/live", (req, res) => {
  return res.status(200).json({
    status: "alive",
    service: "Nexus Commerce Engine",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness Probe: Executes real round-trip command pings to MongoDB and Redis.
 */
router.get("/health/ready", async (req, res) => {
  let dbHealthy = false;
  let dbLatencyMs = null;

  try {
    const start = Date.now();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - start;
      dbHealthy = true;
    }
  } catch {
    dbHealthy = false;
  }

  let redisHealthy = false;
  let redisLatencyMs = null;

  if (isRedisAlive() && redisClient) {
    try {
      const start = Date.now();
      const pong = await redisClient.ping();
      redisLatencyMs = Date.now() - start;
      redisHealthy = pong === "PONG";
    } catch {
      redisHealthy = false;
    }
  }

  const cacheStatus = cacheStore.getStatus();
  const isReady = dbHealthy;
  const statusCode = isReady ? 200 : 503;

  return res.status(statusCode).json({
    success: isReady,
    status: isReady ? "ready" : "unready",
    dependencies: {
      database: {
        status: dbHealthy ? "connected" : "disconnected",
        latency: dbLatencyMs !== null ? `${dbLatencyMs}ms` : "N/A",
      },
      cache: {
        backend: cacheStatus.backend,
        status: redisHealthy ? "connected" : "in-memory-fallback",
        latency: redisLatencyMs !== null ? `${redisLatencyMs}ms` : "N/A",
        localCacheItems: cacheStatus.localCacheSize,
      },
    },
  });
});

/**
 * Comprehensive System Telemetry & Metrics
 */
router.get("/health", async (req, res) => {
  let dbLatencyMs = null;
  let dbConnected = false;

  try {
    const start = Date.now();
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - start;
      dbConnected = true;
    }
  } catch {
    dbConnected = false;
  }

  let redisLatencyMs = null;
  let redisConnected = false;

  if (isRedisAlive() && redisClient) {
    try {
      const start = Date.now();
      const pong = await redisClient.ping();
      redisLatencyMs = Date.now() - start;
      redisConnected = pong === "PONG";
    } catch {
      redisConnected = false;
    }
  }

  const memory = process.memoryUsage();
  const cacheStatus = cacheStore.getStatus();

  return res.status(200).json({
    success: true,
    status: dbConnected ? "healthy" : "degraded",
    service: "Nexus Commerce API Gateway",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    telemetry: {
      nodeVersion: process.version,
      memory: {
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
      infrastructure: {
        database: {
          status: dbConnected ? "connected" : "disconnected",
          latency: dbLatencyMs !== null ? `${dbLatencyMs}ms` : "N/A",
        },
        cache: {
          backend: cacheStatus.backend,
          status: redisConnected ? "connected" : "in-memory-fallback",
          latency: redisLatencyMs !== null ? `${redisLatencyMs}ms` : "N/A",
          localCacheItems: cacheStatus.localCacheSize,
        },
      },
    },
  });
});

// =============================================================================
// 3. DOMAIN PIPELINE MOUNTS
// =============================================================================
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/staff", staffRoutes);
router.use("/support", supportRoutes);
router.use("/stream", streamRoutes);
router.use("/cron", cronRoutes);

export default router;
