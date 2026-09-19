import { OAuth2Client } from "google-auth-library";
import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { initializeUserSession } from "./jwt.controller.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";
import { formatUserResponse } from "#utils/userSerializer.js";

const oAuth2Client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Google authorization code is required.",
    });
  }

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    logger.error({
      msg: "Google OAuth credentials not configured in environment",
    });
    return res.status(500).json({
      success: false,
      message: "Google OAuth service unavailable on server.",
    });
  }

  let googleId, email, name, picture;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    googleId = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch (err) {
    logger.error({
      msg: "Google OAuth token exchange failed",
      error: err.message,
    });
    return res.status(401).json({
      success: false,
      message: "Google identity verification failed or token expired.",
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const isMasterOwner =
    cleanEmail === env.MASTER_OWNER_EMAIL?.toLowerCase().trim();

  let user = await User.findOne({ $or: [{ googleId }, { email: cleanEmail }] });

  if (!user) {
    // New User Registration via Google
    user = await User.create({
      email: cleanEmail,
      name,
      googleId,
      avatarUrl: picture,
      role: isMasterOwner ? "super_admin" : "customer", // 👈 Auto-elevate owner
      isProtected: isMasterOwner,
      isEmailVerified: true,
    });
    logger.info({
      msg: isMasterOwner
        ? "👑 Master Root Owner provisioned via Google Auth"
        : "User registered via Google Auth",
      email: cleanEmail,
      role: user.role,
    });
  } else {
    // Existing User Login via Google
    let shouldSave = false;

    if (!user.googleId) {
      user.googleId = googleId;
      shouldSave = true;
    }
    if (picture && !user.avatarUrl) {
      user.avatarUrl = picture;
      shouldSave = true;
    }

    // ⚡ Auto-upgrade existing account if email matches MASTER_OWNER_EMAIL
    if (isMasterOwner && (user.role !== "super_admin" || !user.isProtected)) {
      user.role = "super_admin";
      user.isProtected = true;
      user.isEmailVerified = true;
      shouldSave = true;
      logger.info({
        msg: "👑 Existing user elevated to Master Super Admin",
        email: cleanEmail,
      });
    }

    if (shouldSave) {
      await user.save();
    }
  }

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: isMasterOwner
      ? "Welcome, Master Owner. Authenticated with Root Super Admin access."
      : "Authenticated successfully with Google Workspace.",
    user: formatUserResponse(user),
  });
});
