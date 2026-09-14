import { Router } from "express";
import { validate } from "#middlewares/validate.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistrationResponse,
  getPasskeyAuthOptions,
  verifyPasskeyAuthResponse,
} from "#controllers/auth/passkey.controller.js";
import {
  register,
  login,
  refreshTokens,
  logout,
  getMe,
} from "#controllers/auth/jwt.controller.js";
import { googleAuthCallback } from "#controllers/auth/google.controller.js";
import { demoLogin } from "#controllers/auth/demo.controller.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "#controllers/auth/address.controller.js";
import {
  PasskeyRegisterVerifySchema,
  PasskeyAuthVerifySchema,
  LoginSchema,
  RegisterPasswordSchema,
  AddressSchema,
} from "#validations/auth.validation.js";

const router = Router();

// =============================================================================
// 1. WEBAUTHN / PASSKEY BIOMETRIC AUTHENTICATION
// =============================================================================
// Optional auth helper to allow both authenticated device additions and new user signups
const optionalAuth = (req, res, next) => {
  if (req.signedCookies?.access_token || req.cookies?.access_token) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.post(
  "/passkey/register-options",
  optionalAuth,
  getPasskeyRegistrationOptions,
);
router.post(
  "/passkey/verify-registration",
  optionalAuth,
  validate(PasskeyRegisterVerifySchema),
  verifyPasskeyRegistrationResponse,
);
router.post("/passkey/auth-options", getPasskeyAuthOptions);
router.post(
  "/passkey/verify-auth",
  validate(PasskeyAuthVerifySchema),
  verifyPasskeyAuthResponse,
);

// =============================================================================
// 2. STANDARD, OAUTH & DEMO AUTHENTICATION
// =============================================================================
router.post("/register", validate(RegisterPasswordSchema), register);
router.post("/login", validate(LoginSchema), login);
router.post("/google", googleAuthCallback);
router.post("/refresh", refreshTokens);
router.post("/demo", demoLogin);

// =============================================================================
// 3. PROTECTED USER PROFILE & ADDRESS BOOK
// =============================================================================
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

router.get("/address", authMiddleware, getAddresses);
router.post("/address", authMiddleware, validate(AddressSchema), addAddress);
router.patch(
  "/address/:addressId",
  authMiddleware,
  validate(AddressSchema),
  updateAddress,
);
router.delete("/address/:addressId", authMiddleware, deleteAddress);

export default router;
