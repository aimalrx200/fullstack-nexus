// /server/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import { requestLogger } from "./middlewares/logger.js";
import masterRouter from "./routes/router.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { createRateLimiter } from "./config/rateLimiter.js"; // Integrated our dynamic factory

const app = express();

// =============================================================================
// 1. ENVIRONMENT & INFRASTRUCTURE TIER
// =============================================================================
if (env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

// =============================================================================
// 2. REQUEST NORMALIZATION & PARSING
// =============================================================================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// 🟢 Vercel Serverless Fix: Force cookie-parser to register secret
app.use((req, res, next) => {
  req.secret = env.COOKIE_SECRET;
  delete req.cookies;
  next();
});

app.use(cookieParser(env.COOKIE_SECRET));

// =============================================================================
// 3. GLOBAL SECURITY HEADERS & TELEMETRY
// =============================================================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const configuredClientUrl = env.CLIENT_URL
  ? env.CLIENT_URL.replace(/\/$/, "")
  : "";

const allowedOrigins = ["http://localhost:5173", configuredClientUrl].filter(
  Boolean,
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, "");

      // Match exact configured origin OR any preview deployments under your vercel project
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        (cleanOrigin.endsWith(".vercel.app") &&
          cleanOrigin.includes("fullstack-nexus"));

      if (isAllowed) {
        callback(null, true);
      } else {
        const corsError = new Error(
          `CORS policy violation: Origin '${origin}' denied.`,
        );
        corsError.status = 403;
        callback(corsError, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-client-instance-id",
      "x-request-id",
      "x-request-timestamp",
    ],
    exposedHeaders: ["set-cookie"],
    maxAge: 600,
  }),
);

app.use(requestLogger);

// =============================================================================
// 4. MULTI-TIER RATE LIMITING (DoS & Brute-Force Safeguard)
// =============================================================================

// 1. Strict, isolated tracker for user sign-in/login attempts
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts allowed
  prefix: "auth-login",
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// 2. Strict, extended tracker to prevent account registration scripting/spam
const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // 3 registrations max per hour
  prefix: "auth-register",
  message:
    "Too many account creation attempts. Please try again after an hour.",
});

// 3. Isolated tracker for the email verification magic-link endpoint
const emailVerificationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 token validation validations allowed
  prefix: "auth-verify",
  message:
    "Too many email verification attempts. Please try again after 15 minutes.",
});

// 4. Balanced catch-all rate limiter protecting the rest of the application ecosystem
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  prefix: "global",
  message: "Too many requests from this IP, please try again later.",
});

// 5. Strict tracker to prevent password recovery request/email spamming
const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 reset link dispatches allowed per window
  prefix: "auth-forgot",
  message:
    "Too many password recovery requests. Please try again after 15 minutes.",
});

// 6. Strict protection to prevent brute-forcing password reset execution tokens
const resetPasswordRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 execution attempts max
  prefix: "auth-reset",
  message:
    "Too many password reset attempts. Please try again after 15 minutes.",
});

// 7. Strict Protection to prevent /refresh endpoint from spamming
const refreshRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 refresh calls per 15 mins (allows active SPA browsing without abuse)
  prefix: "auth-refresh",
  message: "Too many session renewal requests. Please try again shortly.",
});

// Register highly specific authentication defenses first
// 🟢 UPDATED FOR VERSIONING: Pre-route interceptor paths updated to include /v1 namespace layer
app.use("/api/v1/auth/login", loginRateLimiter);
app.use("/api/v1/auth/google", loginRateLimiter);
app.use("/api/v1/auth/demo", loginRateLimiter);
app.use("/api/v1/auth/register", registerRateLimiter);
app.use("/api/v1/auth/verify-email", emailVerificationRateLimiter);
app.use("/api/v1/auth/forgot-password", forgotPasswordRateLimiter);
app.use("/api/v1/auth/reset-password", resetPasswordRateLimiter);

app.use("/api/v1/auth/refresh", refreshRateLimiter);

// General catch-all covers remaining endpoints under the /api/v1 prefix pipeline
app.use("/api/v1", globalRateLimiter);

// =============================================================================
// 5. APPLICATION ROUTING & PIPELINES
// =============================================================================
// 🟢 UPDATED FOR VERSIONING: Direct traffic namespace mounted to version 1 layer
app.use("/api/v1", masterRouter);

// =============================================================================
// 6. CENTRAL EXCEPTION BOUNDARIES
// =============================================================================
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

export default app;
