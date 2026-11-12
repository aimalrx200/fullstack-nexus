import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "#config/env.js";
import { requestLogger } from "#middlewares/logger.js";
import { notFoundHandler, errorHandler } from "#middlewares/errorMiddleware.js";
import { router as apiRouter } from "#routes/router.js";

export const app = express();

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

// API Routes
app.use("/api/v1", apiRouter);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);
