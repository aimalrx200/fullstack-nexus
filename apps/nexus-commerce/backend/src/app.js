import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import env from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import { requestLogger } from "./middlewares/logger.js";
import { createRateLimiter } from "./config/rateLimiter.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import masterRouter from "./routes/router.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Production Trust Proxy
if (env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

// 2. Request Normalization & Parsing
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/payments/stripe/webhook") {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(hpp());

// 3. Robust Cross-Origin Access (Vercel Frontend <-> Render Backend)
const configuredClientUrl = env.CLIENT_URL
  ? env.CLIENT_URL.replace(/\/$/, "")
  : "";

const allowedOrigins = [
  "http://localhost:5175",
  "http://localhost:5173",
  configuredClientUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        const corsError = new Error(
          `CORS policy violation: Origin '${origin}' is not authorized.`,
        );
        corsError.status = 403;
        callback(corsError, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-client-instance-id",
      "x-guest-session-id",
      "x-idempotency-key",
      "x-request-id",
      "x-request-timestamp",
      "x-customer-email",
      "stripe-signature",
    ],
    exposedHeaders: ["set-cookie"],
    maxAge: 600,
  }),
);

// 4. Telemetry Logger
app.use(requestLogger);

// Serve local media uploads publicly
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// 5. Distributed Rate Limiters
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  prefix: "auth",
  message:
    "Too many authentication attempts. Please try again after 15 minutes.",
});

const checkoutLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  prefix: "checkout",
  message:
    "Checkout rate limit reached. Please wait a moment before submitting again.",
});

const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  prefix: "global",
  message: "Too many requests from this network. Please try again shortly.",
});

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/passkey", authLimiter);
app.use("/api/v1/auth/google", authLimiter);
app.use("/api/v1/checkout", checkoutLimiter);
app.use("/api/v1/orders", checkoutLimiter);
app.use("/api/v1", globalLimiter);

// 6. Master Routing
app.use("/api/v1", masterRouter);

// 7. Error Handling
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

export default app;
