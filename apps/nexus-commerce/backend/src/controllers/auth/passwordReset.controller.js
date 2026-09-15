import crypto from "crypto";
import { User, PasswordResetToken, Session } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { enqueueJob, JOB_TYPES } from "#services/jobQueue.js";
import { initializeUserSession } from "./jwt.controller.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import { formatUserResponse } from "#utils/userSerializer.js";
import { cacheStore } from "#config/redis.js";
import { REFRESH_TOKEN_TTL_SECONDS } from "#config/time.constants.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

/**
 * Initiates cryptographic password reset.
 * Timing-attack & enumeration safe: always returns 200 OK.
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (user) {
    // 1. Invalidate any existing pending tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // 2. Generate 32-byte cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiration

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.ip ||
        "127.0.0.1",
      deviceInfo: req.headers["user-agent"] || "Unknown Device",
      expiresAt,
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    // 3. Dispatch reset email in background queue
    await enqueueJob(JOB_TYPES.SEND_PASSWORD_RESET, {
      email: user.email,
      name: user.name,
      resetUrl,
    });

    logger.info({
      msg: "Password reset token generated and queued",
      userId: user._id,
    });
  }

  return res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been dispatched.",
  });
});

/**
 * Validates token, sets new password, revokes previous sessions, and logs in user.
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await PasswordResetToken.findOne({
    tokenHash,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      message: "Password reset link is invalid or has expired.",
    });
  }

  const user = await User.findById(resetRecord.userId);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User account not found." });
  }

  // 1. Update password (pre-save hook hashes with bcrypt)
  user.password = password;
  await user.save();

  // 2. Mark reset token as used
  resetRecord.isUsed = true;
  resetRecord.usedAt = new Date();
  await resetRecord.save();

  // 3. Revoke all existing sessions across MongoDB & Redis for security
  const activeSessions = await Session.find({
    userId: user._id,
    isRevoked: false,
  });
  for (const session of activeSessions) {
    await cacheStore.setex(
      `session:${session.tokenFamilyId}`,
      REFRESH_TOKEN_TTL_SECONDS,
      "REVOKED",
    );
  }
  await Session.updateMany({ userId: user._id }, { $set: { isRevoked: true } });

  // 4. Provision fresh session for the user
  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Password reset successfully. You are now logged in.",
    user: formatUserResponse(user),
  });
});
