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
  let user = await User.findOne({ $or: [{ googleId }, { email: cleanEmail }] });

  if (!user) {
    user = await User.create({
      email: cleanEmail,
      name,
      googleId,
      avatarUrl: picture,
      role: "customer",
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (picture && !user.avatarUrl) user.avatarUrl = picture;
    await user.save();
  }

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Authenticated successfully with Google Workspace.",
    user: formatUserResponse(user),
  });
});
