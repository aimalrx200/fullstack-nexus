// src/controllers/verifyEmail/verifyEmail.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";
import { VERIFY_EMAIL_MESSAGES } from "./verifyEmail.messages.js";
import {
  verifyUserTokenContext,
  provisionVerifiedSession,
} from "./verifyEmail.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  // 1. Structural Gatekeeping Validation
  if (!token || typeof token !== "string") {
    return res.status(400).json(VERIFY_EMAIL_MESSAGES.BAD_LINK);
  }

  const clientInstanceId = req.headers["x-client-instance-id"] || null;
  const deviceInfo = req.headers["user-agent"] || "Unknown Device";
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    "Unknown IP";

  // 2. Process Token Evaluation and Profile Updates (Atomic)
  const { updatedUser, errorStatus } = await verifyUserTokenContext(token);

  if (errorStatus === "EXPIRED_OR_USED") {
    return res.status(400).json(VERIFY_EMAIL_MESSAGES.EXPIRED_OR_USED);
  }

  // 3. Provision Immediate Logged-In State Assets
  const { accessToken, refreshToken } = await provisionVerifiedSession({
    updatedUser,
    deviceInfo,
    ipAddress,
    clientInstanceId,
  });

  // 4. Attach Cookies and Dispatch Resolution Profile
  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: VERIFY_EMAIL_MESSAGES.SUCCESS,
    user: {
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: true,
      name: updatedUser.name || null,
      avatarUrl: updatedUser.avatarUrl || null,
    },
  });
});
