// server/controllers/forgotPassword/forgotPassword.controller.js

import User from "#models/User.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { FORGOT_PASSWORD_MESSAGES } from "./forgotPassword.messages.js";
import { processPasswordResetLink } from "./forgotPassword.service.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  // 🔒 INDUSTRY STANDARD: Account Enumeration Mitigation
  if (!user) {
    return res.status(200).json(FORGOT_PASSWORD_MESSAGES.GENERIC_SUCCESS);
  }

  // Delegate generation and mailing tasks to service layer
  await processPasswordResetLink(user);

  return res.status(200).json(FORGOT_PASSWORD_MESSAGES.GENERIC_SUCCESS);
});
