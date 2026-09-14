import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User, Session } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { generateTokens } from "#services/tokenService.js";
import { cacheStore } from "#config/redis.js";
import env from "#config/env.js";
import {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
  TOKEN_ROTATION_GRACE_WINDOW_MS,
} from "#config/time.constants.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  accessTokenClearCookieOptions,
  refreshTokenClearCookieOptions,
} from "#utils/cookieUtils.js";
import { logger } from "#config/logger.js";
import { formatUserResponse } from "#utils/userSerializer.js";

/**
 * Creates and registers a new active session across MongoDB and Redis.
 */
export const initializeUserSession = async ({ user, req }) => {
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

  await Promise.all([
    Session.create({
      userId: user._id,
      tokenFamilyId,
      tokenHash,
      tokenVersion: initialVersion,
      deviceInfo: req.headers["user-agent"] || "Unknown Browser",
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.ip ||
        "127.0.0.1",
      clientInstanceId: req.headers["x-client-instance-id"] || null,
      expiresAt,
    }),
    cacheStore.setex(
      `session:${tokenFamilyId}`,
      REFRESH_TOKEN_TTL_SECONDS,
      String(initialVersion),
    ),
  ]);

  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "An account with this email address already exists.",
    });
  }

  const user = await User.create({
    name,
    email: cleanEmail,
    password,
    role: "customer",
  });

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: formatUserResponse(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    user: formatUserResponse(user),
  });
});

/**
 * Atomic Token Rotation with 2000ms Concurrency Grace Shield.
 */
export const refreshTokens = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.signedCookies?.refresh_token;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Please sign in to continue." });
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, env.REFRESH_SECRET);
  } catch (err) {
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(401).json({
      success: false,
      message: "Session expired. Please sign in.",
      error: err.message,
    });
  }

  const cacheKey = `session:${decoded.tokenFamilyId}`;
  const [cachedVersion, activeSession, user] = await Promise.all([
    cacheStore.get(cacheKey),
    Session.findOne({ tokenFamilyId: decoded.tokenFamilyId }),
    User.findById(decoded.id),
  ]);

  // 1. Inactive or Revoked Check
  if (
    !activeSession ||
    activeSession.isRevoked ||
    !user ||
    cachedVersion === "REVOKED"
  ) {
    await cacheStore.setex(cacheKey, REFRESH_TOKEN_TTL_SECONDS, "REVOKED");
    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(403).json({
      success: false,
      message: "Session is no longer active. Please sign in.",
    });
  }

  // 2. Concurrency Evaluation & Token Replay Trap
  const incomingHash = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");
  const isVersionMismatch = decoded.version !== activeSession.tokenVersion;
  const isHashMismatch = activeSession.tokenHash !== incomingHash;

  if (isVersionMismatch || isHashMismatch) {
    const isPriorValidToken =
      decoded.version === activeSession.tokenVersion - 1;
    const timeDelta = Date.now() - new Date(activeSession.updatedAt).getTime();
    const isWithinGraceWindow = timeDelta < TOKEN_ROTATION_GRACE_WINDOW_MS; // 👈 2000ms Grace Window in action

    logger.info({
      msg: "Token rotation mismatch evaluated",
      isPriorValidToken,
      timeDeltaMs: timeDelta,
      isWithinGraceWindow,
    });

    if (isPriorValidToken && isWithinGraceWindow) {
      // Synchronize in-flight request: return existing active version tokens
      const syncTokens = generateTokens(
        user,
        activeSession.tokenFamilyId,
        activeSession.tokenVersion,
      );
      res.cookie(
        "access_token",
        syncTokens.accessToken,
        accessTokenCookieOptions,
      );
      res.cookie(
        "refresh_token",
        syncTokens.refreshToken,
        refreshTokenCookieOptions,
      );
      return res
        .status(200)
        .json({ success: true, message: "Session synchronized." });
    }

    // Real Replay Attack Detected: Revoke entire token family
    logger.error({
      msg: "🚨 Token replay attack detected! Blacklisting family",
      family: decoded.tokenFamilyId,
    });
    activeSession.isRevoked = true;
    await activeSession.save();
    await cacheStore.setex(cacheKey, REFRESH_TOKEN_TTL_SECONDS, "REVOKED");

    res.clearCookie("access_token", accessTokenClearCookieOptions);
    res.clearCookie("refresh_token", refreshTokenClearCookieOptions);
    return res.status(403).json({
      success: false,
      message: "Compromised session token detected. Please sign in.",
    });
  }

  // 3. Atomically Advance Token Version
  const nextVersion = activeSession.tokenVersion + 1;
  const newTokens = generateTokens(
    user,
    activeSession.tokenFamilyId,
    nextVersion,
  );
  const nextHash = crypto
    .createHash("sha256")
    .update(newTokens.refreshToken)
    .digest("hex");
  const nextExpiry = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  activeSession.tokenVersion = nextVersion;
  activeSession.tokenHash = nextHash;
  activeSession.expiresAt = nextExpiry;
  await activeSession.save();

  await cacheStore.setex(
    cacheKey,
    REFRESH_TOKEN_TTL_SECONDS,
    String(nextVersion),
  );

  res.cookie("access_token", newTokens.accessToken, accessTokenCookieOptions);
  res.cookie(
    "refresh_token",
    newTokens.refreshToken,
    refreshTokenCookieOptions,
  );

  return res
    .status(200)
    .json({ success: true, message: "Session refreshed successfully." });
});

export const logout = asyncHandler(async (req, res) => {
  const tokenFamilyId = req.user?.tokenFamilyId;
  if (tokenFamilyId) {
    await Promise.all([
      cacheStore.del(`session:${tokenFamilyId}`),
      Session.updateMany({ tokenFamilyId }, { $set: { isRevoked: true } }),
    ]);
  }

  res.clearCookie("access_token", accessTokenClearCookieOptions);
  res.clearCookie("refresh_token", refreshTokenClearCookieOptions);

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-passkeys.credentialPublicKey",
  );
  return res.status(200).json({
    success: true,
    user: formatUserResponse(user, { includeAddresses: true }),
  });
});
