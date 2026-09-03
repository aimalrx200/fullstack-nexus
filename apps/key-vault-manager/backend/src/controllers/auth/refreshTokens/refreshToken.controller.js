// src/controllers/refreshTokens/refreshToken.controller.js

import crypto from "crypto";
import jwt from "jsonwebtoken";
import Session from "#models/Session.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import env from "#config/env.js";
import { REFRESH_MESSAGES } from "./refreshToken.messages.js";
import {
  checkCacheBreach,
  validateSessionEntities,
  evaluateRotationIntegrity,
  commitNextSessionState,
} from "./refreshToken.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.signedCookies.refresh_token;
  const incomingClientInstanceId = req.headers["x-client-instance-id"];

  if (!token) {
    return res.status(401).json(REFRESH_MESSAGES.SIGN_IN_CONTINUE);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.REFRESH_SECRET);
  } catch (err) {
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);

    return res.status(401).json({
      message: REFRESH_MESSAGES.SESSION_ENDED.message,
      error: err.message,
    });
  }

  const cacheKey = `session:${decoded.tokenFamilyId}`;

  // 1. In-Memory Breach Guard Check
  const { isBreached, cachedVersion } = await checkCacheBreach(
    cacheKey,
    decoded.version,
  );
  if (isBreached) {
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(403).json(REFRESH_MESSAGES.SESSION_INACTIVE);
  }

  // 2. Comprehensive Entity Validation
  const validation = await validateSessionEntities({
    cacheKey,
    cachedVersion,
    tokenFamilyId: decoded.tokenFamilyId,
    userId: decoded.id,
  });

  if (validation.errorStatus) {
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);

    const isValidationError =
      validation.errorStatus === "SESSION_ENDED" ||
      validation.errorStatus === "PROFILE_UNAVAILABLE";

    return res
      .status(isValidationError ? 401 : 403)
      .json(REFRESH_MESSAGES[validation.errorStatus]);
  }

  const { activeSession, user } = validation;

  const currentIncomingHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 3. Replay Attack & Request Concurrency Evaluation
  const integrity = await evaluateRotationIntegrity({
    activeSession,
    user,
    decodedVersion: decoded.version,
    currentIncomingHash,
    cacheKey,
  });

  if (integrity.action === "REJECT") {
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(403).json(REFRESH_MESSAGES.SESSION_INACTIVE);
  }

  if (integrity.action === "SYNCHRONIZE") {
    res.cookie(
      "access_token",
      integrity.tokens.accessToken,
      accessTokenCookieOptions,
    );
    res.cookie(
      "refresh_token",
      integrity.tokens.refreshToken,
      refreshTokenCookieOptions,
    );
    return res
      .status(200)
      .json({ success: true, message: REFRESH_MESSAGES.SUCCESS });
  }

  // 4. Advance State Matrix and Issue Brand New Token Pair (Atomic Write)
  const commitResult = await commitNextSessionState(
    activeSession,
    user,
    incomingClientInstanceId,
    cacheKey,
  );

  // 🟢 Atomic Race-Condition Handling
  // If another thread updated tokenVersion between step 2 and step 4, route into evaluation flow
  if (commitResult.isRaceCondition) {
    const freshSession = await Session.findOne({
      tokenFamilyId: decoded.tokenFamilyId,
    });

    if (!freshSession || freshSession.isRevoked) {
      res.clearCookie("access_token", accessTokenClearCookieOptions);
      res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
      return res.status(403).json(REFRESH_MESSAGES.SESSION_INACTIVE);
    }

    const raceIntegrity = await evaluateRotationIntegrity({
      activeSession: freshSession,
      user,
      decodedVersion: decoded.version,
      currentIncomingHash,
      cacheKey,
    });

    if (raceIntegrity.action === "SYNCHRONIZE") {
      res.cookie(
        "access_token",
        raceIntegrity.tokens.accessToken,
        accessTokenCookieOptions,
      );
      res.cookie(
        "refresh_token",
        raceIntegrity.tokens.refreshToken,
        refreshTokenCookieOptions,
      );
      return res
        .status(200)
        .json({ success: true, message: REFRESH_MESSAGES.SUCCESS });
    }

    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(403).json(REFRESH_MESSAGES.SESSION_INACTIVE);
  }

  res.cookie(
    "access_token",
    commitResult.tokens.accessToken,
    accessTokenCookieOptions,
  );
  res.cookie(
    "refresh_token",
    commitResult.tokens.refreshToken,
    refreshTokenCookieOptions,
  );

  return res
    .status(200)
    .json({ success: true, message: REFRESH_MESSAGES.SUCCESS });
});
