// server/controllers/register/register.controller.js

import User from "#models/User.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { REGISTER_MESSAGES } from "./register.messages.js";
import {
  handleExistingUnverifiedUser,
  provisionNewUserWithToken,
} from "./register.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body; // 🟢 Destructured optional name payload
  const normalizedEmail = email.trim().toLowerCase();

  // 1. DEFENSIVE GUARD: Check for Pre-existing Profiles matching username or email
  const existingUser = await User.findOne({
    $or: [{ username }, { email: normalizedEmail }],
  });

  if (existingUser) {
    // 🔒 OAUTH SAFETY LAYER: Inform users if they previously signed up using Google OAuth
    if (existingUser.googleId && !existingUser.password) {
      return res.status(409).json(REGISTER_MESSAGES.OAUTH_CONFLICT);
    }

    // Existing local profile is unverified: Re-dispatch activation link
    if (!existingUser.isVerified) {
      const { status } = await handleExistingUnverifiedUser(existingUser);
      if (status === "RACE_CONDITION_ABSORBED") {
        return res
          .status(200)
          .json(REGISTER_MESSAGES.REGISTRATION_RACE_ABSORBED);
      }
      return res.status(200).json(REGISTER_MESSAGES.REGISTRATION_UPDATED);
    }

    // Account is active and completely verified
    return res.status(409).json(REGISTER_MESSAGES.CONFLICT);
  }

  // 2. NEW REGISTRATION CODE PATH (HARDENED CONCURRENCY & TRANSACTION WRAPS)
  const { status } = await provisionNewUserWithToken(
    username,
    normalizedEmail,
    password,
    name, // 🟢 Forwarded to internal registration orchestrator
  );

  if (status === "ALREADY_EXISTS") {
    return res.status(409).json(REGISTER_MESSAGES.CONFLICT);
  }

  return res.status(201).json(REGISTER_MESSAGES.SUCCESS);
});
