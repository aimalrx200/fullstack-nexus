// server/controllers/oAuth/google/google.service.js

import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "#models/User.js";
import Session from "#models/Session.js";
import env from "#config/env.js";
import { generateTokens } from "#services/generateTokens.js";
import { sessionCache } from "#utils/sessionCache.js";
import {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "#config/time.constants.js";

// Initialize client with "postmessage" channel routing for secure popup exchanges
const oAuth2Client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

/**
 * Exchanges a frontend auth code for verified Google payload traits.
 */
export const verifyGoogleAuthorizationCode = async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);

  const ticket = await oAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
};

/**
 * Handles identity consolidation: finds, creates, or links standard profiles to Google credentials.
 */
export const upsertGoogleOAuthUser = async (payload) => {
  const { sub: googleId, email, name, picture } = payload;
  const cleanEmail = email.trim().toLowerCase();

  let user = await User.findOne({
    $or: [{ googleId }, { email: cleanEmail }],
  });

  if (!user) {
    // Pristine new user registration via Google authentication
    user = await User.create({
      username: `user_${googleId.substring(0, 8)}`,
      email: cleanEmail,
      googleId,
      name,
      avatarUrl: picture,
      isVerified: true, // Google identity provider serves as implicit verification baseline
    });
  } else if (!user.googleId) {
    // Account Linking: Merge active local credential record with OAuth parameters safely
    user.googleId = googleId;
    if (!user.avatarUrl) user.avatarUrl = picture;
    await user.save();
  }

  return user;
};

/**
 * Establishes a brand-new sliding session context across MongoDB and Redis concurrently.
 */
export const initializeOAuthSession = async ({
  user,
  clientInstanceId,
  deviceInfo,
  ipAddress,
}) => {
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

  // Commit session metadata to database persistence layers and the distributed RAM cache
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

  return { accessToken, refreshToken };
};
