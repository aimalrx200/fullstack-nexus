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

/**
 * Generates WebAuthn registration options.
 * - Authenticated: registers a new passkey to the active session account.
 * - Unauthenticated: allows passwordless registration for NEW accounts only.
 */
export const getPasskeyRegistrationOptions = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const authenticatedUserId = req.user?.id;

  let user;

  if (authenticatedUserId) {
    // 1. Authenticated Device Binding Flow
    user = await User.findById(authenticatedUserId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User account not found." });
    }
  } else {
    // 2. Unauthenticated Signup Flow (Guards against Account Hijacking)
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

    // Temporary unpersisted model for challenge generation
    user = new User({
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split("@")[0],
    });
  }

  const options = await createPasskeyRegistrationOptions(user);
  user.currentChallenge = options.challenge;

  // Persist challenge if user already exists in DB
  if (!user.isNew) {
    await user.save();
  }

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

    if (authenticatedUserId) {
      user =
        await User.findById(authenticatedUserId).select("+currentChallenge");
    } else {
      const cleanEmail = email?.toLowerCase().trim();
      user = await User.findOne({ email: cleanEmail }).select(
        "+currentChallenge",
      );

      // If user was created fresh in registration step
      if (!user) {
        user = new User({
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split("@")[0],
          role: "customer",
        });
      } else if (user.passkeys?.length > 0 || user.password) {
        // Prevent unauthenticated overwrite of existing user
        return res.status(403).json({
          success: false,
          message: "Please sign in before adding passkeys to this account.",
        });
      }
    }

    if (!user || !user.currentChallenge) {
      return res.status(400).json({
        success: false,
        message: "Registration challenge expired or missing. Please try again.",
      });
    }

    const { verified, passkey, error } = await verifyPasskeyRegistration(
      user,
      response,
      user.currentChallenge,
    );

    if (!verified || !passkey) {
      return res.status(400).json({
        success: false,
        message: error || "Biometric Passkey verification failed.",
      });
    }

    // Prevent duplicate passkey credential IDs
    const alreadyExists = user.passkeys?.some(
      (pk) => pk.credentialID === passkey.credentialID,
    );

    if (!alreadyExists) {
      user.passkeys.push(passkey);
    }

    user.currentChallenge = undefined;
    await user.save();

    const { accessToken, refreshToken } = await initializeUserSession({
      user,
      req,
    });

    res.cookie("access_token", accessToken, accessTokenCookieOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenCookieOptions);

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
  const user = await User.findOne({ email: email?.toLowerCase().trim() });

  const options = await createPasskeyAuthOptions(user);

  if (user) {
    user.currentChallenge = options.challenge;
    await user.save();
  }

  return res.status(200).json({ success: true, options });
});

export const verifyPasskeyAuthResponse = asyncHandler(async (req, res) => {
  const { email, response } = req.body;
  const user = await User.findOne({
    email: email?.toLowerCase().trim(),
  }).select("+currentChallenge");

  if (!user || !user.currentChallenge) {
    return res.status(400).json({
      success: false,
      message: "Passkey challenge expired or invalid.",
    });
  }

  const { verified, error } = await verifyPasskeyAuth(
    user,
    response,
    user.currentChallenge,
  );

  if (!verified) {
    return res.status(401).json({
      success: false,
      message: error || "Passkey biometric authentication failed.",
    });
  }

  user.currentChallenge = undefined;
  await user.save();

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
