import env from "./env.js";

const IS_DEV = env.NODE_ENV === "development";

// 1. Authentication Lifespans
export const ACCESS_TOKEN_TTL_MINUTES = IS_DEV
  ? env.ACCESS_TOKEN_EXPIRY_DEV
  : env.ACCESS_TOKEN_EXPIRY_PROD;

export const REFRESH_TOKEN_TTL_MS = IS_DEV
  ? env.REFRESH_TOKEN_EXPIRY_DEV * 60 * 1000
  : env.REFRESH_TOKEN_EXPIRY_PROD * 24 * 60 * 60 * 1000;

export const ACCESS_TOKEN_TTL_MS = ACCESS_TOKEN_TTL_MINUTES * 60 * 1000;
export const REFRESH_TOKEN_TTL_SECONDS = Math.ceil(REFRESH_TOKEN_TTL_MS / 1000);

// 2. JWT Expiration Formats
export const ACCESS_TOKEN_JWT_EXPIRY = `${ACCESS_TOKEN_TTL_MINUTES}m`;
export const REFRESH_TOKEN_JWT_EXPIRY = IS_DEV
  ? `${env.REFRESH_TOKEN_EXPIRY_DEV}m`
  : `${env.REFRESH_TOKEN_EXPIRY_PROD}d`;

// 3. E-Commerce Concurrency & Flash-Sale Stock Holds
export const INVENTORY_HOLD_TTL_SECONDS = env.INVENTORY_HOLD_TTL_SECONDS; // 600s = 10 mins
export const IDEMPOTENCY_TTL_SECONDS = 120; // 2 minutes
export const TOKEN_ROTATION_GRACE_WINDOW_MS = 2000; // 2-second concurrency buffer
export const WEBAUTHN_CHALLENGE_TTL_SECONDS = 300; // 5 minutes
export const DEFAULT_CACHE_TTL_SECONDS = 3600; // 1 hour
