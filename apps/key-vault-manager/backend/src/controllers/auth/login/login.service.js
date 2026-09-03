// server/controllers/login/login.service.js

import crypto from "crypto";
import EmailVerificationToken from "#models/EmailVerificationToken.js";
import Session from "#models/Session.js";
import { sessionCache } from "#utils/sessionCache.js";
import { sendVerificationEmail } from "#services/emailService.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";
import { VERIFICATION_EMAIL_COOLDOWN_MS } from "#config/time.constants.js";

/**
 * Manages the generation, storage, and dispatch of verification emails with a 60s cooldown.
 */
export const handleUnverifiedUserThrottle = async (user) => {
  const existingToken = await EmailVerificationToken.findOne({
    userId: user._id,
  });

  // 🧼 Clean initialization using the single source of truth constant
  const isWithinCooldown =
    existingToken &&
    Date.now() - new Date(existingToken.createdAt).getTime() <
      VERIFICATION_EMAIL_COOLDOWN_MS;

  if (isWithinCooldown) return { throttleActive: true };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await EmailVerificationToken.findOneAndUpdate(
    { userId: user._id },
    { $set: { tokenHash, createdAt: new Date() } },
    { upsert: true },
  );

  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;

  sendVerificationEmail(user.email, verificationLink).catch((mailError) => {
    logger.error({
      msg: "Background verification email dispatch failure",
      userId: user._id,
      error: mailError.message,
    });
  });

  return { throttleActive: false };
};

/**
 * Terminates older sessions belonging to a specific tab context or device boundary.
 */
export const purgeTargetedActiveSessions = async (
  userId,
  clientInstanceId,
  deviceInfo,
) => {
  const cleanupQuery = {
    userId,
    isRevoked: false,
    ...(clientInstanceId ? { clientInstanceId } : { deviceInfo }),
  };

  const oldSessions = await Session.find(cleanupQuery).select("tokenFamilyId");

  if (oldSessions.length === 0) return;

  const oldFamilyIds = oldSessions.map((s) => s.tokenFamilyId);

  const redisEvictionPromises = oldFamilyIds.map((id) =>
    sessionCache.del(`session:${id}`),
  );

  await Promise.all([
    Session.updateMany(
      { tokenFamilyId: { $in: oldFamilyIds }, isRevoked: false },
      { $set: { isRevoked: true } },
    ),
    ...redisEvictionPromises,
  ]);
};
