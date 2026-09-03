// server/controllers/register/register.service.js

import crypto from "crypto";
import User from "#models/User.js";
import EmailVerificationToken from "#models/EmailVerificationToken.js";
import { sendVerificationEmail } from "#services/emailService.js";
import { logger } from "#config/logger.js";
import env from "#config/env.js";

/**
 * Dispatches an asynchronous email in the background while logging any connection errors safely.
 */
const dispatchVerificationEmail = (
  userId,
  email,
  rawToken,
  isRedispatch = false,
) => {
  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;

  const msg = isRedispatch
    ? "Background verification re-dispatch failure"
    : "Background registration email dispatch failure";

  sendVerificationEmail(email, verificationLink).catch((mailError) => {
    logger.error({ msg, userId, email, error: mailError.message });
  });
};

/**
 * Handles the special path where a matching unverified user exists.
 * Re-dispatches a fresh token via an atomic upsert.
 */
export const handleExistingUnverifiedUser = async (existingUser) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  try {
    await EmailVerificationToken.findOneAndUpdate(
      { userId: existingUser._id },
      { $set: { tokenHash, createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }, // 🟢 Fixed: Updated to modern syntax
    );

    dispatchVerificationEmail(
      existingUser._id,
      existingUser.email,
      rawToken,
      true,
    );
    return { status: "UPDATED" };
  } catch (dbError) {
    if (dbError.code === 11000) {
      logger.warn({
        msg: "🛡️ Concurrent registration upsert race condition caught and absorbed safely. Suppressing duplicate mail dispatch.",
        userId: existingUser._id,
      });
      return { status: "RACE_CONDITION_ABSORBED" };
    }
    throw dbError;
  }
};

/**
 * Provisions a pristine user record, generates their initial verification document,
 * and handles emergency rollbacks if any downstream indexing errors hit the execution line.
 */
export const provisionNewUserWithToken = async (
  username,
  email,
  password,
  name,
) => {
  // 🟢 Transmit name profile context to Mongoose model instantiation
  const newUser = new User({ name, username, email, password });

  try {
    await newUser.save();
  } catch (userError) {
    if (userError.code === 11000) return { status: "ALREADY_EXISTS" };
    throw userError;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  try {
    await EmailVerificationToken.create({
      userId: newUser._id,
      tokenHash,
    });

    dispatchVerificationEmail(newUser._id, newUser.email, rawToken, false);
    return { status: "CREATED" };
  } catch (tokenError) {
    // 🧹 Emergency Rollback: Delete the user record if token indexing crashes
    await User.deleteOne({ _id: newUser._id }).catch((rollbackErr) => {
      logger.error({
        msg: "🚨 FATAL: Failed to clean up orphaned registration record during exception rollback.",
        userId: newUser._id,
        error: rollbackErr.message,
      });
    });

    if (tokenError.code === 11000) {
      logger.warn({
        msg: "🛡️ Concurrent pristine token insert collision caught and rolled back safely.",
        userId: newUser._id,
      });
      return { status: "CREATED" };
    }
    throw tokenError;
  }
};
