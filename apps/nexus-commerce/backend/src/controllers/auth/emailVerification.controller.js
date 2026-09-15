import crypto from "crypto";
import { User, EmailVerificationToken } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { enqueueJob, JOB_TYPES } from "#services/jobQueue.js";
import { formatUserResponse } from "#utils/userSerializer.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

/**
 * Utility to generate a cryptographic verification token and enqueue the email.
 */
export const dispatchVerificationToken = async (user) => {
  // 1. Invalidate any existing verification tokens for this user
  await EmailVerificationToken.deleteMany({ userId: user._id });

  // 2. Generate 32-byte cryptographically random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hour expiration

  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;

  // 3. Dispatch asynchronously via background job queue
  await enqueueJob(JOB_TYPES.SEND_EMAIL_VERIFICATION, {
    email: user.email,
    name: user.name,
    verifyUrl,
  });

  logger.info({
    msg: "Email verification token generated & dispatched",
    userId: user._id,
  });
};

/**
 * Validates verification token and marks user as verified.
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body?.token || req.query?.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is required.",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const tokenDoc = await EmailVerificationToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      message:
        "Verification link is invalid or has expired. Please request a new one.",
    });
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User account not found.",
    });
  }

  user.isEmailVerified = true;
  await user.save();

  // Clean up used token
  await EmailVerificationToken.findByIdAndDelete(tokenDoc._id);

  logger.info({ msg: "User email verified successfully", userId: user._id });

  return res.status(200).json({
    success: true,
    message: "Your email has been verified successfully!",
    user: formatUserResponse(user),
  });
});

/**
 * Resends a fresh verification email to an unverified user.
 * POST /api/v1/auth/resend-verification
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const email = req.body?.email || req.user?.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address is required.",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Timing-attack and enumeration defense: generic success response
  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an unverified account with that email exists, a new verification link has been sent.",
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "This email address is already verified.",
    });
  }

  await dispatchVerificationToken(user);

  return res.status(200).json({
    success: true,
    message: "A new verification email has been dispatched.",
  });
});
