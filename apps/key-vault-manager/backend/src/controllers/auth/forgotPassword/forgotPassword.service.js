// server/controllers/forgotPassword/forgotPassword.service.js

import crypto from "crypto";
import PasswordResetToken from "#models/PasswordResetToken.js";
import { sendVerificationEmail } from "#services/emailService.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

/**
 * Creates a unique password reset token hash via an atomic upsert and dispatches the outbound email.
 */
export const processPasswordResetLink = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Atomic Upsert Optimization
  await PasswordResetToken.findOneAndUpdate(
    { userId: user._id },
    { $set: { tokenHash, createdAt: new Date() } },
    { upsert: true },
  );

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

  sendVerificationEmail(user.email, resetLink).catch((mailError) => {
    logger.error({
      msg: "Background password reset email dispatch failure",
      userId: user._id,
      error: mailError.message,
    });
  });
};
