import rateLimit from "express-rate-limit";
import { ONE_MINUTE_MS } from "#config/time.constants.js";

// Anti-spam guard for public candidate resume submissions (Max 15 per 15 min per IP)
export const applyRateLimiter = rateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many applications submitted from this IP. Please try again later.",
  },
});

// Anti-brute-force guard for recruiter authentication (Max 20 attempts per 15 min per IP)
export const authRateLimiter = rateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// General API throughput limiter across all endpoints (Max 300 per 15 min)
export const generalRateLimiter = rateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});
