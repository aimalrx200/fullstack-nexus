import { env } from "#config/env.js";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
} from "#config/time.constants.js";

const isProduction = env.NODE_ENV === "production";

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
});

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.cookie(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
};
