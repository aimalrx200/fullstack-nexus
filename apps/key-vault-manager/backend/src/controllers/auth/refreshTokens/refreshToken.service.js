// src/controllers/refreshTokens/refreshToken.service.js

import crypto from "crypto";
import Session from "#models/Session.js";
import User from "#models/User.js";
import { sessionCache } from "#utils/sessionCache.js";
import { generateTokens } from "#services/generateTokens.js";
import {
  COMPROMISE_CONTAINMENT_TTL_SECONDS,
  TOKEN_ROTATION_GRACE_WINDOW_MS,
  REFRESH_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_MS,
} from "#config/time.constants.js";

/**
 * Handles fast in-memory breach checks. Revokes backend sessions if a mismatch occurs.
 */
export const checkCacheBreach = async (cacheKey, decodedVersion) => {
  const cachedVersion = await sessionCache.get(cacheKey);

  console.log(
    `⏱️  [Cache Diagnostic Check] Key: ${cacheKey} | Incoming Decoded Ver: ${decodedVersion} | Cache Holds State: ${cachedVersion === null ? "⚠️ NULL (EXPIRED)" : cachedVersion}`,
  );

  if (
    cachedVersion === "REVOKED" ||
    (cachedVersion !== null && Number(cachedVersion) > decodedVersion)
  ) {
    if (cachedVersion !== "REVOKED") {
      await sessionCache.setex(
        cacheKey,
        COMPROMISE_CONTAINMENT_TTL_SECONDS,
        "REVOKED",
      );
      await Session.updateMany(
        { tokenFamilyId: cacheKey.split(":")[1] },
        { $set: { isRevoked: true } },
      );
    }
    return { isBreached: true };
  }
  return { isBreached: false, cachedVersion };
};

/**
 * Validates baseline domain entity states (session existence, explicit revoking, matching sandbox instances, user profile status)
 */
export const validateSessionEntities = async ({
  cacheKey,
  cachedVersion,
  tokenFamilyId,
  userId,
}) => {
  const [activeSession, user] = await Promise.all([
    Session.findOne({ tokenFamilyId }),
    User.findById(userId),
  ]);

  if (!activeSession) {
    await sessionCache.del(cacheKey);
    return { errorStatus: "SESSION_ENDED" };
  }

  if (activeSession.isRevoked) {
    if (cachedVersion !== "REVOKED") {
      await sessionCache.setex(
        cacheKey,
        COMPROMISE_CONTAINMENT_TTL_SECONDS,
        "REVOKED",
      );
    }
    return { errorStatus: "SESSION_INACTIVE" };
  }

  if (!user) {
    await Session.deleteOne({ tokenFamilyId });
    await sessionCache.del(cacheKey);
    return { errorStatus: "PROFILE_UNAVAILABLE" };
  }

  if (!user.isVerified) {
    await Promise.all([
      Session.updateMany({ tokenFamilyId }, { $set: { isRevoked: true } }),
      sessionCache.setex(
        cacheKey,
        COMPROMISE_CONTAINMENT_TTL_SECONDS,
        "REVOKED",
      ),
    ]);
    return { errorStatus: "VERIFICATION_REQUIRED" };
  }

  return { activeSession, user };
};

/**
 * Inspects signatures for version/hash manipulation.
 * Resolves concurrent frontend requests via a short grace window, or flags an explicit breach.
 */
export const evaluateRotationIntegrity = async ({
  activeSession,
  user,
  decodedVersion,
  currentIncomingHash,
  cacheKey,
}) => {
  const isVersionMismatch = decodedVersion !== activeSession.tokenVersion;
  const isHashMismatch = activeSession.tokenHash !== currentIncomingHash;

  const timeNow = Date.now();
  const dbRecordUpdatedAt = activeSession.updatedAt
    ? new Date(activeSession.updatedAt).getTime()
    : timeNow;
  const dynamicTimeDelta = timeNow - dbRecordUpdatedAt;

  console.log(
    `⏱️  [Database Diagnostic Check] Family: ${activeSession.tokenFamilyId}\n` +
      `   |-> Versions -> Decoded: ${decodedVersion} | DB Current Active: ${activeSession.tokenVersion} (Mismatch: ${isVersionMismatch})\n` +
      `   |-> Timing Metrics -> Delta Since Last DB Write: ${dynamicTimeDelta}ms | Grace Threshold Limit: ${TOKEN_ROTATION_GRACE_WINDOW_MS}ms`,
  );

  if (isVersionMismatch || isHashMismatch) {
    const isPriorValidToken = decodedVersion === activeSession.tokenVersion - 1;
    const isWithinGraceWindow =
      dynamicTimeDelta < TOKEN_ROTATION_GRACE_WINDOW_MS;

    console.warn(
      `⚠️  [Security Warning Evaluation] Structural mismatch found. Resolving strategy:\n` +
        `   |-> Parameter Validation -> Is Prior Token: ${isPriorValidToken} | Within Safe Time Threshold: ${isWithinGraceWindow}`,
    );

    if (isPriorValidToken && isWithinGraceWindow) {
      console.log(
        `✨ [Concurrency Sync] Matching conditions hit. Synchronizing session indices.`,
      );
      const syncTokens = generateTokens(
        user,
        activeSession.tokenFamilyId,
        activeSession.tokenVersion,
      );
      return { action: "SYNCHRONIZE", tokens: syncTokens };
    }

    // Real Breach Detected
    console.error(
      `🚨 [Eviction Enforcement] Security breach triggered. Blacklisting: ${cacheKey}`,
    );
    activeSession.isRevoked = true;
    await activeSession.save();
    await sessionCache.setex(
      cacheKey,
      COMPROMISE_CONTAINMENT_TTL_SECONDS,
      "REVOKED",
    );
    return { action: "REJECT" };
  }

  return { action: "PROCEED" };
};

/**
 * ATOMICALLY advances token versions, signs fresh keys, and writes updates concurrently across MongoDB and Redis.
 */
export const commitNextSessionState = async (
  activeSession,
  user,
  incomingClientInstanceId,
  cacheKey,
) => {
  const expectedVersion = activeSession.tokenVersion;
  const nextVersion = expectedVersion + 1;

  const tokens = generateTokens(user, activeSession.tokenFamilyId, nextVersion);
  const nextTokenHash = crypto
    .createHash("sha256")
    .update(tokens.refreshToken)
    .digest("hex");

  const nowMs = Date.now();
  const preciseExpiryDate = new Date(nowMs + REFRESH_TOKEN_TTL_MS);

  // 🟢 Mongoose 9 Atomic Condition Update
  // Ensures another thread hasn't modified tokenVersion between our query and write
  const updatedSession = await Session.findOneAndUpdate(
    {
      tokenFamilyId: activeSession.tokenFamilyId,
      tokenVersion: expectedVersion, // Optimistic concurrency lock matching condition
      isRevoked: false,
    },
    {
      $set: {
        tokenVersion: nextVersion,
        tokenHash: nextTokenHash,
        expiresAt: preciseExpiryDate,
        ...(incomingClientInstanceId && {
          clientInstanceId: incomingClientInstanceId,
        }),
      },
    },
    { new: true },
  );

  // 🟡 RACE CONDITION DETECTED: Another concurrent request incremented the version first
  if (!updatedSession) {
    return { isRaceCondition: true, tokens: null };
  }

  console.log(
    `🛰️  [Database/Cache Sync Matrix Update]\n` +
      `   |-> Family Context ID: ${updatedSession.tokenFamilyId} | Target State Version: ${nextVersion}\n` +
      `   |-> MongoDB Model target 'expiresAt': ${preciseExpiryDate.toISOString()}\n` +
      `   |-> Distributed Cache Allocation TTL: ${REFRESH_TOKEN_TTL_SECONDS} seconds`,
  );

  await sessionCache.setex(
    cacheKey,
    REFRESH_TOKEN_TTL_SECONDS,
    String(nextVersion),
  );

  return { isRaceCondition: false, tokens };
};
