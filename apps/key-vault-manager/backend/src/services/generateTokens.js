// server/services/generateTokens.js

import jwt from "jsonwebtoken";
import env from "#config/env.js";
import {
  ACCESS_TOKEN_JWT_EXPIRY,
  REFRESH_TOKEN_JWT_EXPIRY,
} from "#config/time.constants.js";

/**
 * Generates an encrypted access and refresh token pair signed against the
 * centralized JWT expiry rules.
 */
export const generateTokens = (user, tokenFamilyId, tokenVersion) => {
  // Safeguard: Extract string representation to avoid native BSON identification drops
  const userId = user._id ? user._id.toString() : user.id;

  if (!userId) {
    throw new Error("Missing authentication data");
  }

  // Access Token Execution Payload
  const accessToken = jwt.sign(
    {
      id: userId,
      name: user.name || "", // 🟢 ADDED: Encodes optional name field safely (defaults to empty string if missing)
      username: user.username,
      email: user.email, // 🟢 ADDED: Encodes email address claim directly into structural JWT context
      avatarUrl: user.avatarUrl || null, // 🟢 ADDED: Encodes image tracking reference context directly into JWT
      role: user.role || "user",
      tokenFamilyId: tokenFamilyId,
      version: tokenVersion,
      isVerified: user.isVerified ?? false,
    },
    env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_JWT_EXPIRY, // 🧼 Centralized: Evaluates to e.g., "1m" or "15m"
    },
  );

  // Refresh Token Execution Payload
  const refreshToken = jwt.sign(
    {
      id: userId,
      tokenFamilyId: tokenFamilyId,
      version: tokenVersion,
    },
    env.REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_JWT_EXPIRY, // 🧼 Centralized: Evaluates to e.g., "2m" or "7d"
    },
  );

  return { accessToken, refreshToken };
};
