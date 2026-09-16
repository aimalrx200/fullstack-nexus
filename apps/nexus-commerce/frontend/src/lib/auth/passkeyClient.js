import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import { authApi } from "../api/authApi";

/**
 * FIDO2 / Passkey Browser Client Helper
 * Handles WebAuthn native prompts, cancellation handling, and server handshakes.
 */
export const passkeyClient = {
  /**
   * Checks if current browser/device supports WebAuthn & biometrics (Face ID / Touch ID / Windows Hello)
   */
  isSupported: () => {
    return (
      typeof window !== "undefined" &&
      typeof window.PublicKeyCredential !== "undefined" &&
      browserSupportsWebAuthn()
    );
  },

  /**
   * Registers a new passkey on the current device
   */
  registerPasskey: async ({ email, name } = {}) => {
    if (!passkeyClient.isSupported()) {
      throw new Error(
        "Biometric Passkeys are not supported on this browser or platform. Please use a password instead.",
      );
    }

    try {
      // 1. Fetch challenge from backend
      const options = await authApi.getPasskeyRegisterOptions({ email, name });

      // 2. Trigger native OS biometric prompt (Touch ID, Face ID, Passkey)
      const registrationResponse = await startRegistration({
        optionsJSON: options,
      });

      // 3. Verify cryptographic attestation with backend
      return await authApi.verifyPasskeyRegistration({
        email,
        name,
        response: registrationResponse,
      });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        throw new Error("Passkey registration was cancelled by user.", {
          cause: err,
        });
      }
      if (err.name === "InvalidStateError") {
        throw new Error(
          "This device or passkey is already registered to your account.",
          { cause: err },
        );
      }
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Passkey registration failed.",
        { cause: err },
      );
    }
  },

  /**
   * Authenticates user using an existing passkey
   */
  authenticatePasskey: async (email) => {
    if (!passkeyClient.isSupported()) {
      throw new Error(
        "Passkey sign-in is not supported on this device. Please sign in with your password.",
      );
    }

    try {
      // 1. Fetch authentication challenge from backend
      const options = await authApi.getPasskeyAuthOptions(email);

      // 2. Trigger native OS biometric authentication prompt
      const authResponse = await startAuthentication({
        optionsJSON: options,
      });

      // 3. Verify cryptographic assertion with backend
      return await authApi.verifyPasskeyAuth({
        email,
        response: authResponse,
      });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        throw new Error("Biometric sign-in was cancelled.", { cause: err });
      }
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Biometric authentication failed.",
        { cause: err },
      );
    }
  },
};
