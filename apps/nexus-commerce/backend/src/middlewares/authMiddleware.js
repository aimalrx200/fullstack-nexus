import jwt from "jsonwebtoken";
import env from "#config/env.js";
import { Session } from "#models/index.js";
import { cacheStore } from "#config/redis.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { logger } from "#config/logger.js";
import {
  TOKEN_ROTATION_GRACE_WINDOW_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "#config/time.constants.js";
import {
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.signedCookies?.access_token || req.cookies?.access_token;

  if (!token) {
    logger.debug({ msg: "Auth Middleware: No access token in signed cookies" });
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in.",
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const cacheKey = `session:${decoded.tokenFamilyId}`;

    // 1. High-Speed Cache Hit Check
    let cachedVersion = await cacheStore.get(cacheKey);
    let activeSession = null;
    let currentVersion;

    if (cachedVersion === "REVOKED") {
      res.clearCookie("access_token", accessTokenClearCookieOptions);
      res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
      return res.status(403).json({
        success: false,
        message: "Session revoked. Please sign in again.",
      });
    }

    if (cachedVersion !== null) {
      currentVersion = parseInt(cachedVersion, 10);
    } else {
      // 2. Cache Miss: Fallback to MongoDB Session collection
      activeSession = await Session.findOne({
        tokenFamilyId: decoded.tokenFamilyId,
      });

      if (!activeSession || activeSession.isRevoked) {
        await cacheStore.setex(cacheKey, REFRESH_TOKEN_TTL_SECONDS, "REVOKED");
        res.clearCookie("access_token", accessTokenClearCookieOptions);
        res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
        return res
          .status(403)
          .json({ success: false, message: "Session is no longer active." });
      }

      currentVersion = activeSession.tokenVersion;

      // Background cache hydration
      const remainingSeconds = Math.max(
        1,
        Math.ceil(
          (new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000,
        ),
      );
      cacheStore
        .setex(cacheKey, remainingSeconds, String(currentVersion))
        .catch(() => {});
    }

    // 3. Concurrency Grace Window Verification
    if (decoded.version !== currentVersion) {
      if (!activeSession) {
        activeSession = await Session.findOne({
          tokenFamilyId: decoded.tokenFamilyId,
        });
      }

      const isPriorToken =
        activeSession && decoded.version === activeSession.tokenVersion - 1;
      const timeDelta = activeSession
        ? Date.now() - new Date(activeSession.updatedAt).getTime()
        : Infinity;
      const isWithinGrace = timeDelta < TOKEN_ROTATION_GRACE_WINDOW_MS;

      if (!isPriorToken || !isWithinGrace) {
        return res.status(401).json({
          success: false,
          message: "Session version mismatch. Please sign in.",
        });
      }

      logger.debug({
        msg: "In-flight token absorbed via concurrency grace window",
        timeDelta,
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      avatarUrl: decoded.avatarUrl || null, // 👈 Added
      tokenFamilyId: decoded.tokenFamilyId,
      version: decoded.version,
    };

    return next();
  } catch (err) {
    logger.debug({ msg: "JWT verification failed", error: err.message });
    return res
      .status(401)
      .json({ success: false, message: "Session expired or invalid." });
  }
});
