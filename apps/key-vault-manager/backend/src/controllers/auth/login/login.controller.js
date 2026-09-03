// server/controllers/login/login.login.controller.js

import crypto from "crypto";
import User from "#models/User.js";
import Session from "#models/Session.js";
import { generateTokens } from "#services/generateTokens.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { sessionCache } from "#utils/sessionCache.js";
import { LOGIN_MESSAGES } from "./login.messages.js";
import {
  handleUnverifiedUserThrottle,
  purgeTargetedActiveSessions,
} from "./login.service.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "#config/time.constants.js";

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; // 🔴 Updated from username to identifier
  const clientInstanceId = req.headers["x-client-instance-id"] || null;
  const deviceInfo = req.headers["user-agent"] || "Unknown Device";
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.ip ||
    "Unknown IP";

  // 1. Evaluate User Profile Existence and Credentials via Dual Properties
  // Normalize the input to lowercase in case it is an email address
  const cleanIdentifier = identifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [
      { username: identifier.trim() }, // Usernames can preserve original casing checks
      { email: cleanIdentifier },
    ],
  }).select("+password");

  // 🔒 SECURITY FIX: If the profile exists but has NO password (OAuth account), fail credential access immediately
  if (!user || !user.password || !(await user.comparePassword(password))) {
    return res.status(401).json(LOGIN_MESSAGES.INVALID_CREDENTIALS);
  }

  // 2. Enforce Verification Throttling Gates
  if (!user.isVerified) {
    const { throttleActive } = await handleUnverifiedUserThrottle(user);

    if (throttleActive) {
      return res.status(403).json(LOGIN_MESSAGES.COOLDOWN_ACTIVE);
    }
    return res.status(403).json(LOGIN_MESSAGES.VERIFICATION_SENT);
  }

  // 3. Purge Existing Context-Specific Sessions
  await purgeTargetedActiveSessions(user._id, clientInstanceId, deviceInfo);

  // 4. Provision Fresh Session Materials
  const tokenFamilyId = crypto.randomBytes(16).toString("hex");
  const initialVersion = 0;

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const { accessToken, refreshToken } = generateTokens(
    user,
    tokenFamilyId,
    initialVersion,
  );
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // 5. Commit Session States Concurrently
  await Promise.all([
    Session.create({
      userId: user._id,
      tokenFamilyId,
      tokenHash,
      tokenVersion: initialVersion,
      deviceInfo,
      ipAddress,
      clientInstanceId,
      expiresAt,
    }),
    sessionCache.setex(
      `session:${tokenFamilyId}`,
      REFRESH_TOKEN_TTL_SECONDS,
      String(initialVersion),
    ),
  ]);

  // 6. Set Cookies and Return Structured Profile
  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: LOGIN_MESSAGES.SUCCESS,
    user: {
      username: user.username,
      email: user.email, // Convenient addition for frontend context hydration
      role: user.role,
      isVerified: true,
      name: user.name || null, // 🟢 Synced for frontend hydration symmetry
      avatarUrl: user.avatarUrl || null, // 🟢 Synced so normal logins also render avatars if attached later
    },
  });
});
