import env from "#config/env.js";
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
} from "#config/time.constants.js";

const isProd = env.NODE_ENV === "production";
const shouldSign = true;

// In production cross-domain setups (Vercel), SameSite is 'None' with Secure: true
const sameSitePolicy = isProd ? "None" : "Lax";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: sameSitePolicy,
  path: "/", // ✅ Changed from "/api/v1" to "/" to ensure universal browser attachment
  signed: shouldSign,
  maxAge: ACCESS_TOKEN_TTL_MS,
  partitioned: isProd, // CHIPS cookie partitioning for cross-site domains
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: sameSitePolicy,
  path: "/", // ✅ Changed from "/api/v1" to "/"
  signed: shouldSign,
  maxAge: REFRESH_TOKEN_TTL_MS,
  partitioned: isProd,
};

export const accessTokenClearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: sameSitePolicy,
  path: "/",
  signed: shouldSign,
  maxAge: 0,
  expires: new Date(0),
  partitioned: isProd,
};

export const refreshTokenClearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: sameSitePolicy,
  path: "/",
  signed: shouldSign,
  maxAge: 0,
  expires: new Date(0),
  partitioned: isProd,
};
