// src/controllers/verifyEmail/verifyEmail.service.js

import crypto from "crypto";
import User from "#models/User.js";
import Session from "#models/Session.js";
import EmailVerificationToken from "#models/EmailVerificationToken.js";
import { sessionCache } from "#utils/sessionCache.js";
import { generateTokens } from "#services/generateTokens.js";
import { logger } from "#config/logger.js";
import {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "#config/time.constants.js";

/**
 * Atomically consumes the verification link token and transitions the user state.
 * Guarantees strict single-use execution under concurrent requests.
 */
export const verifyUserTokenContext = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // ATOMIC CONSUMPTION: Retrieve and delete in one step to prevent race conditions.
  const tokenDoc = await EmailVerificationToken.findOneAndDelete({ tokenHash });

  if (!tokenDoc) {
    return { errorStatus: "EXPIRED_OR_USED" };
  }

  // Atomically transition User state to verified (Mongoose 9 compliant)
  const updatedUser = await User.findOneAndUpdate(
    { _id: tokenDoc.userId },
    { $set: { isVerified: true } },
    { returnDocument: "after" }, // replaces deprecation of { new: true }
  );

  // Structural Fault Recovery: Ghost user record protection
  if (!updatedUser) {
    logger.warn({
      msg: "⚠️ Orphaned verification token targeted. Associated user no longer exists.",
      userId: tokenDoc.userId,
    });
    return { errorStatus: "EXPIRED_OR_USED" };
  }

  return { updatedUser };
};

/**
 * Handles session provisioning and rapid distributed gateway cache hydration.
 */
export const provisionVerifiedSession = async ({
  updatedUser,
  deviceInfo,
  ipAddress,
  clientInstanceId,
}) => {
  const tokenFamilyId = crypto.randomBytes(16).toString("hex");
  const initialVersion = 0;

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const { accessToken, refreshToken } = generateTokens(
    updatedUser,
    tokenFamilyId,
    initialVersion,
  );

  const sessionTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await Promise.all([
    Session.create({
      userId: updatedUser._id,
      tokenFamilyId,
      tokenHash: sessionTokenHash,
      tokenVersion: initialVersion,
      deviceInfo,
      ipAddress,
      clientInstanceId,
      expiresAt,
    }),
    sessionCache.setex(
      `session:${tokenFamilyId}`,
      REFRESH_TOKEN_TTL_SECONDS,
      String(initialVersion),
    ),
  ]);

  logger.info({
    msg: "🔐 Email verification complete. Immediate user session initialized.",
    userId: updatedUser._id,
    tokenFamilyId,
  });

  return { accessToken, refreshToken };
};
