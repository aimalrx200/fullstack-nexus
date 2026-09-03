// server/config/time.constants.js

import env from "./env.js";

const IS_DEV = env.NODE_ENV === "development";

// ===========================================================================
// ⏳ 1. RAW LIFESPANS IN STANDARD TIME UNITS
// ===========================================================================
// Standardizes weights: Dev counts are always Minutes, Prod counts are Days/Minutes
export const ACCESS_TOKEN_LIFESPAN_MINUTES = IS_DEV
  ? env.ACCESS_TOKEN_EXPIRY_DEV
  : env.ACCESS_TOKEN_EXPIRY_PROD;

export const REFRESH_TOKEN_LIFESPAN_DAYS_OR_MINUTES = IS_DEV
  ? env.REFRESH_TOKEN_EXPIRY_DEV
  : env.REFRESH_TOKEN_EXPIRY_PROD;

// ===========================================================================
// 🛠️ 2. DERIVED MILLISECOND CONVERSIONS (For Cookies & Calculations)
// ===========================================================================
export const ACCESS_TOKEN_TTL_MS = ACCESS_TOKEN_LIFESPAN_MINUTES * 60 * 1000;

export const REFRESH_TOKEN_TTL_MS = IS_DEV
  ? env.REFRESH_TOKEN_EXPIRY_DEV * 60 * 1000 // Dev: Minutes -> MS
  : env.REFRESH_TOKEN_EXPIRY_PROD * 24 * 60 * 60 * 1000; // Prod: Days -> MS

export const EMAIL_VERIFICATION_TTL_MS =
  env.EMAIL_VERIFICATION_TOKEN_TTL * 1000;

// ===========================================================================
// 🏎️ 3. DERIVED SECOND CONVERSIONS (For Distributed Cache Caching TTLs)
// ===========================================================================
export const REFRESH_TOKEN_TTL_SECONDS = Math.ceil(REFRESH_TOKEN_TTL_MS / 1000);

export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS =
  env.EMAIL_VERIFICATION_TOKEN_TTL;

// ===========================================================================
// 🔏 4. JWT ENGINE FORMAT STRINGS (For jsonwebtoken verification keys)
// ===========================================================================
export const ACCESS_TOKEN_JWT_EXPIRY = `${ACCESS_TOKEN_LIFESPAN_MINUTES}m`;

export const REFRESH_TOKEN_JWT_EXPIRY = IS_DEV
  ? `${env.REFRESH_TOKEN_EXPIRY_DEV}m`
  : `${env.REFRESH_TOKEN_EXPIRY_PROD}d`;

// ===========================================================================
// ⏳ 5. THROTTLES & SECURITY COOLDOWNS
// ===========================================================================
export const VERIFICATION_EMAIL_COOLDOWN_MS = 60 * 1000; // 60-second dispatch limit
export const TOKEN_ROTATION_GRACE_WINDOW_MS = 2000; // 2-second concurrency buffer

// 🟢 FIX: Scale the blacklist lock to match the Refresh Token's maximum lifespan
// In Dev: Equals 120s (2 mins)
// In Prod: Equals 604,800s (7 days)
export const COMPROMISE_CONTAINMENT_TTL_SECONDS = REFRESH_TOKEN_TTL_SECONDS;

// ===========================================================================
// ⏳ 6. REGISTRATION & ACCOUNT RECOVERY LIFECYCLES
// ===========================================================================
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 900; // 15-minute native auto-purge
export const UNVERIFIED_ACCOUNT_PURGE_TTL_SECONDS = 86400; // 24-hour retention window
