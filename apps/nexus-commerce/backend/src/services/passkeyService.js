import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

export const createPasskeyRegistrationOptions = async (user) => {
  const userPasskeys = user.passkeys || [];

  return generateRegistrationOptions({
    rpName: env.RP_NAME,
    rpID: env.RP_ID,
    // Convert string ID to Uint8Array required by SimpleWebAuthn v10+
    userID: new TextEncoder().encode(user._id.toString()),
    userName: user.email,
    userDisplayName: user.name || user.email.split("@")[0],
    attestationType: "none",
    excludeCredentials: userPasskeys.map((pk) => ({
      id: pk.credentialID,
      transports: pk.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });
};

export const verifyPasskeyRegistration = async (
  user,
  response,
  expectedChallenge,
) => {
  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.ORIGIN,
      expectedRPID: env.RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        verification.registrationInfo;

      const newPasskey = {
        credentialID: credential.id,
        credentialPublicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: response.response?.transports || ["internal", "hybrid"],
      };

      return { verified: true, passkey: newPasskey };
    }

    return { verified: false };
  } catch (err) {
    logger.error({
      msg: "WebAuthn registration verification error",
      error: err.message,
    });
    return { verified: false, error: err.message };
  }
};

export const createPasskeyAuthOptions = async (user) => {
  const userPasskeys = user ? user.passkeys : [];

  return generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: "preferred",
    allowCredentials: userPasskeys.map((pk) => ({
      id: pk.credentialID,
      transports: pk.transports,
    })),
  });
};

export const verifyPasskeyAuth = async (user, response, expectedChallenge) => {
  const passkey = user.passkeys.find((pk) => pk.credentialID === response.id);
  if (!passkey)
    throw new Error("Passkey credential not found on user account.");

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: env.ORIGIN,
      expectedRPID: env.RP_ID,
      authenticator: {
        credentialID: passkey.credentialID,
        credentialPublicKey: new Uint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (verification.verified) {
      passkey.counter = verification.authenticationInfo.newCounter;
      await user.save();
      return { verified: true };
    }

    return { verified: false };
  } catch (err) {
    logger.error({
      msg: "WebAuthn authentication verification error",
      error: err.message,
    });
    return { verified: false, error: err.message };
  }
};
