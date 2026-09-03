// server/controllers/oAuth/google/google.controller.js

import { asyncHandler } from "#utils/asyncHandler.js";
import { GOOGLE_MESSAGES } from "./google.messages.js";
import {
  verifyGoogleAuthorizationCode,
  upsertGoogleOAuthUser,
  initializeOAuthSession,
} from "./google.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";

export const googleLogin = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const clientInstanceId = req.headers["x-client-instance-id"] || null;
  const deviceInfo = req.headers["user-agent"] || "Unknown Device";
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    "Unknown IP";

  // 1. Guard against un-orchestrated code transmission payloads
  if (!code) {
    return res.status(400).json(GOOGLE_MESSAGES.CODE_MISSING);
  }

  // 2. Resolve external cryptography validations with Google Certificate authorities
  const googlePayload = await verifyGoogleAuthorizationCode(code);

  // 3. Resolve internal identity mapping branches
  const user = await upsertGoogleOAuthUser(googlePayload);

  // 4. Provision fresh sliding session state materials
  const { accessToken, refreshToken } = await initializeOAuthSession({
    user,
    clientInstanceId,
    deviceInfo,
    ipAddress,
  });

  // 5. Append encrypted tokens into signed httpOnly cookie storage
  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: GOOGLE_MESSAGES.SUCCESS,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: true,
      name: user.name || null, // 🟢 Hydrates frontend layout headings instantly
      avatarUrl: user.avatarUrl || null, // 🟢 Populates the navbar profile dropdown icon out of the box
    },
  });
});
