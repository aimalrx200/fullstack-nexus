import { User } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import {
  createPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  createPasskeyAuthOptions,
  verifyPasskeyAuth,
} from "#services/passkeyService.js";
import { initializeUserSession } from "./jwt.controller.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "#utils/cookieUtils.js";
import { formatUserResponse } from "#utils/userSerializer.js";
import { cacheStore } from "#config/redis.js";
import { WEBAUTHN_CHALLENGE_TTL_SECONDS } from "#config/time.constants.js";

/**
 * Generates WebAuthn registration options.
 * - Authenticated: registers a new passkey to the active session account.
 * - Unauthenticated: allows passwordless registration for NEW accounts only.
 */
export const getPasskeyRegistrationOptions = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const authenticatedUserId = req.user?.id;

  let user;
  let challengeKey;

  if (authenticatedUserId) {
    // 1. Authenticated Device Binding Flow
    user = await User.findById(authenticatedUserId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User account not found." });
    }
    challengeKey = `passkey:reg:uid:${user._id}`;
  } else {
    // 2. Unauthenticated Signup Flow
    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email address is required for passkey registration.",
      });
    }

    user = await User.findOne({ email: cleanEmail });

    if (user) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please sign in with your password or existing passkey to add new devices.",
      });
    }

    user = new User({
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split("@")[0],
    });
    challengeKey = `passkey:reg:email:${cleanEmail}`;
  }

  const options = await createPasskeyRegistrationOptions(user);

  await cacheStore.setex(
    challengeKey,
    WEBAUTHN_CHALLENGE_TTL_SECONDS,
    options.challenge,
  );

  return res.status(200).json({ success: true, options });
});

/**
 * Verifies WebAuthn registration response and stores the public key.
 */
export const verifyPasskeyRegistrationResponse = asyncHandler(
  async (req, res) => {
    const { email, name, response } = req.body;
    const authenticatedUserId = req.user?.id;

    let user;
    let challengeKey;

    if (authenticatedUserId) {
      user = await User.findById(authenticatedUserId);
      challengeKey = `passkey:reg:uid:${authenticatedUserId}`;
    } else {
      const cleanEmail = email?.toLowerCase().trim();
      user = await User.findOne({ email: cleanEmail });
      challengeKey = `passkey:reg:email:${cleanEmail}`;

      if (!user) {
        user = new User({
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split("@")[0],
          role: "customer",
        });
      } else if (user.passkeys?.length > 0 || user.password) {
        return res.status(403).json({
          success: false,
          message: "Please sign in before adding passkeys to this account.",
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const expectedChallenge = await cacheStore.get(challengeKey);

    if (!expectedChallenge) {
      return res.status(400).json({
        success: false,
        message: "Registration challenge expired or missing. Please try again.",
      });
    }

    const { verified, passkey, error } = await verifyPasskeyRegistration(
      user,
      response,
      expectedChallenge,
    );

    if (!verified || !passkey) {
      return res.status(400).json({
        success: false,
        message: error || "Biometric Passkey verification failed.",
      });
    }

    await cacheStore.del(challengeKey);

    const alreadyExists = user.passkeys?.some(
      (pk) => pk.credentialID === passkey.credentialID,
    );

    if (!alreadyExists) {
      if (!user.passkeys) user.passkeys = [];
      user.passkeys.push(passkey);
    }

    await user.save();

    // ⚡ FIX: Only create a new session document if user was unauthenticated
    // If the user already has an active session from registration, reuse it!
    if (!authenticatedUserId) {
      const { accessToken, refreshToken } = await initializeUserSession({
        user,
        req,
      });

      res.cookie("access_token", accessToken, accessTokenCookieOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);
    }

    return res.status(200).json({
      success: true,
      message: authenticatedUserId
        ? "New passkey added to your account."
        : "Passkey registered successfully! Welcome to Nexus Commerce.",
      user: formatUserResponse(user),
    });
  },
);

export const getPasskeyAuthOptions = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email?.toLowerCase().trim();
  const user = cleanEmail ? await User.findOne({ email: cleanEmail }) : null;

  const options = await createPasskeyAuthOptions(user);

  if (cleanEmail) {
    const challengeKey = `passkey:auth:${cleanEmail}`;
    await cacheStore.setex(
      challengeKey,
      WEBAUTHN_CHALLENGE_TTL_SECONDS,
      options.challenge,
    );
  }

  return res.status(200).json({ success: true, options });
});

export const verifyPasskeyAuthResponse = asyncHandler(async (req, res) => {
  const { email, response } = req.body;
  const cleanEmail = email?.toLowerCase().trim();

  if (!cleanEmail) {
    return res.status(400).json({
      success: false,
      message: "Email address is required for authentication.",
    });
  }

  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Account not found for provided email.",
    });
  }

  const challengeKey = `passkey:auth:${cleanEmail}`;
  const expectedChallenge = await cacheStore.get(challengeKey);

  if (!expectedChallenge) {
    return res.status(400).json({
      success: false,
      message: "Passkey challenge expired or invalid. Please try again.",
    });
  }

  const { verified, error } = await verifyPasskeyAuth(
    user,
    response,
    expectedChallenge,
  );

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: error || "Passkey biometric authentication failed.",
    });
  }

  await cacheStore.del(challengeKey);

  const { accessToken, refreshToken } = await initializeUserSession({
    user,
    req,
  });

  res.cookie("access_token", accessToken, accessTokenCookieOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Biometric sign in verified.",
    user: formatUserResponse(user),
  });
});
