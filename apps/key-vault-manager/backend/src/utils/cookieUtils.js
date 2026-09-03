// server/utils/cookieUtils.js

import env from "#config/env.js";
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from "#config/time.constants.js";

const isProd = env.NODE_ENV === "production";

// Force cryptographic signatures across both environments for strict behavioral parity
const shouldSign = true;

// 🟢 UPDATED FOR VERSIONING: Aligns cookie storage scope boundaries with /api/v1
const baseApiPath = "/api/v1";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Strict",
  path: baseApiPath,
  signed: shouldSign,
  maxAge: ACCESS_TOKEN_TTL_MS, // 🧼 Centralized: Handles dev/prod branching automatically
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Strict",
  path: baseApiPath, // ✅ FIXED: Must mirror the access token path exactly
  signed: shouldSign,
  maxAge: REFRESH_TOKEN_TTL_MS, // 🧼 Centralized: Handles dev/prod units seamlessly
};

// ---------------------------------------------------------------------------
// 🧼 Defensive Cookie Clearance Options
// ---------------------------------------------------------------------------
export const accessTokenClearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Strict",
  path: baseApiPath,
  signed: shouldSign,
  maxAge: 0, // ✅ FIXED: Overrides browser state storage caches immediately
  expires: new Date(0), // ✅ FIXED: Moves expiration explicitly to 1970
};

export const refreshTokenClearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Strict",
  path: baseApiPath, // ✅ FIXED: Path alignment guarantees clean unmounting
  signed: shouldSign,
  maxAge: 0,
  expires: new Date(0),
};
