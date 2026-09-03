// server/controllers/resetPassword/resetPassword.controller.js

import crypto from "crypto";
import User from "#models/User.js";
import PasswordResetToken from "#models/PasswordResetToken.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { logger } from "#config/logger.js";
import { RESET_PASSWORD_MESSAGES } from "./resetPassword.messages.js";
import { globallyTerminateUserSessions } from "./resetPassword.service.js";
import {
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 1. 🔒 SECURITY GATE: Atomic One-Time Token Consumption
  const consumedTokenDoc = await PasswordResetToken.findOneAndDelete({
    tokenHash,
  });

  if (!consumedTokenDoc) {
    return res.status(400).json(RESET_PASSWORD_MESSAGES.INVALID_OR_EXPIRED);
  }

  const user = await User.findById(consumedTokenDoc.userId).select("+password");

  if (!user) {
    return res.status(404).json(RESET_PASSWORD_MESSAGES.INVALID_OR_EXPIRED);
  }

  // 2. 🔒 OAUTH SAFETY LAYER: Defend against applying local credentials over exclusive OAuth profiles
  if (user.googleId && !user.password) {
    logger.warn({
      msg: "🛡️ Intercepted password reset attempt targeting an exclusive Google OAuth profile.",
      userId: user._id,
    });
    return res.status(400).json(RESET_PASSWORD_MESSAGES.OAUTH_RESTRICTED);
  }

  // Update password context parameters
  user.password = password;
  await user.save();

  // 3. 🔐 GLOBAL REVOCATION EVENT: Nuclear Eject Protocol
  await globallyTerminateUserSessions(user._id);

  // Clear cookie context states out of the current client window scope
  res.clearCookie("access_token", accessTokenClearCookieOptions);
  res.clearCookie("refresh_token", refreshTokenClearCookieOptions);

  logger.info({
    msg: "🔒 Password reset complete. Active sessions globally terminated.",
    userId: user._id,
  });

  return res.status(200).json(RESET_PASSWORD_MESSAGES.SUCCESS);
});
