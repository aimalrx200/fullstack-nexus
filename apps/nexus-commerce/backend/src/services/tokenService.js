import jwt from "jsonwebtoken";
import env from "#config/env.js";
import {
  ACCESS_TOKEN_JWT_EXPIRY,
  REFRESH_TOKEN_JWT_EXPIRY,
} from "#config/time.constants.js";

export const generateTokens = (user, tokenFamilyId, tokenVersion = 0) => {
  const userId = user._id ? user._id.toString() : user.id;

  const accessToken = jwt.sign(
    {
      id: userId,
      email: user.email,
      name: user.name || "",
      role: user.role || "customer",
      avatarUrl: user.avatarUrl || null, // 👈 Added
      tokenFamilyId,
      version: tokenVersion,
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_JWT_EXPIRY },
  );

  const refreshToken = jwt.sign(
    {
      id: userId,
      tokenFamilyId,
      version: tokenVersion,
    },
    env.REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_JWT_EXPIRY },
  );

  return { accessToken, refreshToken };
};
