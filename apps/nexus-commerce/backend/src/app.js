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

// 1. Production Trust Proxy (Required for Vercel / Render reverse proxies)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}

// 2. Request Normalization & Body Parsers
// Bypass JSON and URL-encoded parsers for Stripe webhooks so express.raw can access the unparsed stream
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/payments/stripe/webhook")) {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/payments/stripe/webhook")) {
    return next();
  }
  express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
});

// 3. Vercel Serverless Cookie Fix:
// Reset pre-attached req.cookies from @vercel/node so cookie-parser processes signed cookies with env.COOKIE_SECRET
app.use((req, res, next) => {
  if (req.cookies && !req.secret) {
    delete req.cookies;
  }
  req.secret = env.COOKIE_SECRET;
  next();
});

// 4. Initialize Cookie Parser with genuine environment secret
app.use(cookieParser(env.COOKIE_SECRET));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(hpp());

// 5. Robust Cross-Origin Access (Vercel Frontend <-> Backend)
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
      "Authorization",
      "x-client-instance-id",
      "x-guest-session-id",
      "x-idempotency-key",
      "x-request-id",
      "x-request-timestamp",
      "x-customer-email",
      "x-cron-secret",
      "stripe-signature",
    ],
    exposedHeaders: ["set-cookie"],
    maxAge: 600,
  }),
);

// 6. Telemetry Logger
app.use(requestLogger);

// Serve local media uploads publicly
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// 7. Distributed Rate Limiters
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

const streamLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 60,
  prefix: "stream",
  message:
    "Live stream connection rate limit exceeded. Reconnecting shortly...",
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
app.use("/api/v1/stream", streamLimiter);
app.use("/api/v1", globalLimiter);

// 8. Base Welcome Endpoint
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "Nexus Commerce API Engine",
    status: "online",
    healthCheck: "/api/v1/health",
    version: "1.0.0",
  });
});

// 9. Master Routing
app.use("/api/v1", masterRouter);

// 10. Error Handling
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

export default app;
