// src/middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import env from "#config/env.js";
import Session from "#models/Session.js";
import { sessionCache } from "#utils/sessionCache.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { logger } from "#config/logger.js";
import {
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";
import {
  COMPROMISE_CONTAINMENT_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  TOKEN_ROTATION_GRACE_WINDOW_MS,
} from "#config/time.constants.js";

/**
 * Middleware to validate the Access Token and check for session validity
 * via the Session model and high-speed in-memory cache.
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.signedCookies?.access_token || req.cookies?.access_token;

  if (!token) {
    logger.debug({
      msg: "Auth Middleware: No access token provided in signed cookies.",
    });
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    // 1. Verify token signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const cacheKey = `session:${decoded.tokenFamilyId}`;

    logger.debug({
      msg: "Auth Middleware: JWT verified successfully",
      userId: decoded.id,
      tokenFamilyId: decoded.tokenFamilyId,
      decodedVersion: decoded.version,
    });

    // 2. High-Speed Cache Check
    let cachedVersion = await sessionCache.get(cacheKey);
    let currentVersion;
    let activeSession = null;

    // 🟢 Fast-fail gate for previously blacklisted sessions directly in memory
    if (cachedVersion === "REVOKED") {
      logger.warn({
        msg: "Auth Middleware: Fast-fail triggered (Session marked as REVOKED in cache)",
        cacheKey,
        userId: decoded.id,
      });

      res.clearCookie("access_token", accessTokenClearCookieOptions);
      res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
      return res.status(403).json({
        message: "Your session is no longer active. Please sign in again.",
      });
    }

    if (cachedVersion !== null) {
      currentVersion = parseInt(cachedVersion, 10);
      logger.debug({
        msg: "Auth Middleware: Cache HIT",
        cacheKey,
        cachedVersion: currentVersion,
      });
    } else {
      // 3. HARDENED CACHE MISS FALLBACK
      logger.warn({
        msg: "Auth Middleware: Cache MISS. Fallback query to MongoDB",
        cacheKey,
        tokenFamilyId: decoded.tokenFamilyId,
      });

      activeSession = await Session.findOne({
        tokenFamilyId: decoded.tokenFamilyId,
      });

      if (!activeSession) {
        logger.warn({
          msg: "Auth Middleware: No active session found in database",
          tokenFamilyId: decoded.tokenFamilyId,
        });
        return res
          .status(401)
          .json({ message: "Your session has ended. Please sign in again." });
      }

      // Fast-failing security gate for revoked session trees
      if (activeSession.isRevoked) {
        logger.warn({
          msg: "Auth Middleware: Database record marked as isRevoked. Updating cache to REVOKED.",
          cacheKey,
          tokenFamilyId: decoded.tokenFamilyId,
        });

        await sessionCache.setex(
          cacheKey,
          COMPROMISE_CONTAINMENT_TTL_SECONDS,
          "REVOKED",
        );
        res.clearCookie("access_token", accessTokenClearCookieOptions);
        res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
        return res.status(403).json({
          message: "Your session is no longer active. Please sign in again.",
        });
      }

      currentVersion = activeSession.tokenVersion;

      // =============================================================================
      // 🏎️ DYNAMIC HYDRATION TTL: Calculate remaining session lifetime
      // =============================================================================
      const createdAtMs = activeSession.createdAt
        ? new Date(activeSession.createdAt).getTime()
        : Date.now();
      const expiresAtMs = activeSession.expiresAt
        ? new Date(activeSession.expiresAt).getTime()
        : createdAtMs + REFRESH_TOKEN_TTL_SECONDS * 1000;

      const remainingTtlSeconds = Math.max(
        1,
        Math.ceil((expiresAtMs - Date.now()) / 1000),
      );

      sessionCache
        .setex(cacheKey, remainingTtlSeconds, String(currentVersion))
        .then(() => {
          logger.debug({
            msg: "Auth Middleware: Background cache hydration succeeded",
            cacheKey,
            hydratedVersion: currentVersion,
            remainingTtlSeconds,
          });
        })
        .catch((cacheErr) => {
          logger.error({
            msg: "Auth Middleware: Background cache hydration failure",
            cacheKey,
            error: cacheErr.message,
          });
        });
    }

    // =============================================================================
    // 🔒 DEFENSIVE CONCURRENCY & REVOCATION COMPROMISE GATES
    // =============================================================================

    if (decoded.version === currentVersion) {
      logger.debug({
        msg: "Auth Middleware: Token version matches current active session version",
        decodedVersion: decoded.version,
        currentVersion,
      });
    } else {
      logger.warn({
        msg: "Auth Middleware: Token version mismatch detected",
        decodedVersion: decoded.version,
        currentVersion,
      });

      // If we skipped the database read due to a cache hit, fetch it now
      if (!activeSession) {
        logger.debug({
          msg: "Auth Middleware: Fetching database session for concurrency check",
          tokenFamilyId: decoded.tokenFamilyId,
        });

        activeSession = await Session.findOne({
          tokenFamilyId: decoded.tokenFamilyId,
        });
      }

      // Lock out immediately if the database row was revoked out-of-band
      if (!activeSession || activeSession.isRevoked) {
        logger.warn({
          msg: "Auth Middleware: Session revoked during concurrency check. Setting cache to REVOKED.",
          cacheKey,
        });

        await sessionCache.setex(
          cacheKey,
          COMPROMISE_CONTAINMENT_TTL_SECONDS,
          "REVOKED",
        );
        res.clearCookie("access_token", accessTokenClearCookieOptions);
        res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
        return res.status(403).json({
          message: "Your session is no longer active. Please sign in again.",
        });
      }

      // Explicitly check for an outdated token version replay
      if (decoded.version < currentVersion) {
        const isPriorValidToken = decoded.version === currentVersion - 1;
        const timeDelta = activeSession.updatedAt
          ? Date.now() - new Date(activeSession.updatedAt).getTime()
          : Infinity;

        const isWithinGraceWindow = timeDelta < TOKEN_ROTATION_GRACE_WINDOW_MS;

        logger.info({
          msg: "Auth Middleware: Outdated token version evaluation",
          decodedVersion: decoded.version,
          currentVersion,
          isPriorValidToken,
          timeDeltaMs: timeDelta,
          graceWindowMs: TOKEN_ROTATION_GRACE_WINDOW_MS,
          isWithinGraceWindow,
        });

        if (!isPriorValidToken || !isWithinGraceWindow) {
          logger.warn({
            msg: "Auth Middleware: Token version replay rejected (Outside grace threshold or invalid previous version)",
            decodedVersion: decoded.version,
            currentVersion,
          });

          return res.status(401).json({
            message: "Your session has changed. Please sign in again.",
          });
        }

        logger.info({
          msg: "Auth Middleware: Concurrency grace window PASSED. Allowing inflight request to proceed.",
          decodedVersion: decoded.version,
        });
      } else {
        logger.error({
          msg: "Auth Middleware: Future or forged token version detected!",
          decodedVersion: decoded.version,
          currentVersion,
        });

        return res.status(401).json({
          message: "Invalid session state detected. Please sign in again.",
        });
      }
    }

    // 5. EXTRACT CLAIMS DIRECTLY FROM PAYLOAD
    req.user = {
      id: decoded.id,
      name: decoded.name || null,
      username: decoded.username,
      email: decoded.email || null,
      avatarUrl: decoded.avatarUrl || null,
      role: decoded.role,
      isVerified: decoded.isVerified ?? true,
      tokenFamilyId: decoded.tokenFamilyId,
    };

    logger.debug({
      msg: "Auth Middleware: Request context successfully populated. Proceeding to next().",
      userId: req.user.id,
    });

    return next();
  } catch (ex) {
    logger.error({
      msg: "Auth Middleware: Exception caught during authentication verification",
      error: ex.message,
      stack: env.NODE_ENV === "development" ? ex.stack : undefined,
    });

    return res.status(401).json({
      message: "Your session has ended. Please sign in again.",
    });
  }
});
