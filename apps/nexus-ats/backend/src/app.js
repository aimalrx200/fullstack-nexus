// apps/nexus-ats/backend/src/app.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "#config/env.js";
import { connectDB } from "#config/db.js";
import { requestLogger } from "#middlewares/logger.js";
import { notFoundHandler, errorHandler } from "#middlewares/errorMiddleware.js";
import { router as apiRouter } from "#routes/router.js";

export const app = express();

// Ensure DB is connected across all serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Security and Parsers
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5176"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request Telemetry
if (env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// Root redirect / health helper for direct domain hits
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Nexus ATS Core API Gateway",
    status: "OPERATIONAL",
    health: "/api/v1/health",
  });
});

// API Routes
app.use("/api/v1", apiRouter);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// CRITICAL FOR VERCEL: Provide both default export and named export
export default app;
