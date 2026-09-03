// apps/key-vault-manager/backend/src/controllers/auth/demo/demo.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";
import { DEMO_MESSAGES } from "./demo.messages.js";
import { getOrCreateDemoUser, initializeDemoSession } from "./demo.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";

export const demoLogin = asyncHandler(async (req, res) => {
  const clientInstanceId = req.headers["x-client-instance-id"] || null;
  const deviceInfo = req.headers["user-agent"] || "Evaluator Showcase Browser";
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    "127.0.0.1";

  // 1. Get or self-heal the verified demo user
  const user = await getOrCreateDemoUser();

  // 2. Issue fresh token pairs and register active session
  const { accessToken, refreshToken } = await initializeDemoSession({
    user,
    clientInstanceId,
    deviceInfo,
    ipAddress,
  });

  // 3. Attach signed httpOnly cookies
  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: DEMO_MESSAGES.SUCCESS,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: true,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
    },
  });
});
