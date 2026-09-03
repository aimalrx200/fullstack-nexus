// /apps/key-vault-manager/backend/src/controllers/logout/logout.service.js

import jwt from "jsonwebtoken";
import env from "#config/env.js";
import Session from "#models/Session.js";
import { sessionCache } from "#utils/sessionCache.js";
import { logger } from "#config/logger.js";

/**
 * Multi-layer fallback extraction engine to find the tokenFamilyId
 * if your authMiddleware context layer is bypassed.
 */
export const extractTokenFamilyIdFallback = async (req, clientInstanceId) => {
  // Attempt A: Extract from Access Token Cookie
  if (req.signedCookies?.access_token) {
    try {
      const decodedAccess = jwt.verify(
        req.signedCookies.access_token,
        env.JWT_SECRET,
      );
      return decodedAccess.tokenFamilyId;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Access token signature expired or malformed; swallow and proceed
    }
  }

  // Attempt B: Extract from Refresh Token Cookie
  if (req.signedCookies?.refresh_token) {
    try {
      const decodedRefresh = jwt.verify(
        req.signedCookies.refresh_token,
        env.REFRESH_SECRET,
      );
      return decodedRefresh.tokenFamilyId;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Refresh token signature expired or unavailable; swallow and proceed
    }
  }

  // Attempt C: Header Tracking Sandbox Fallback
  if (clientInstanceId) {
    const activeSession = await Session.findOne({
      clientInstanceId,
      isRevoked: false,
    });
    if (activeSession) {
      return activeSession.tokenFamilyId;
    }
  }

  return null;
};

/**
 * Concurrently removes the memory segments from your distributed
 * cache and flags session blocks as revoked inside MongoDB.
 */
export const revokeSessionState = async (tokenFamilyId) => {
  const cacheKey = `session:${tokenFamilyId}`;

  await Promise.all([
    sessionCache.del(cacheKey).catch((err) =>
      logger.error({
        msg: "Cache engine eviction skipped or key missing during logout.",
        error: err.message,
        tokenFamilyId,
      }),
    ),
    Session.updateMany(
      { tokenFamilyId, isRevoked: false },
      { $set: { isRevoked: true } },
    ),
  ]);
};
