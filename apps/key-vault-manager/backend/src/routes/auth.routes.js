// apps/key-vault-manager/backend/src/routes/auth.routes.js

import { Router } from "express";
import { validate } from "#middlewares/validate.js";

// ---------------------------------------------------------------------------
// 📂 LOCAL CREDENTIALS & SESSIONS CONTROLLERS
// ---------------------------------------------------------------------------
import { register } from "#controllers/auth/register/register.controller.js";
import { RegisterSchema } from "#controllers/auth/register/register.validation.js";

import { login } from "#controllers/auth/login/login.controller.js";
import { LoginSchema } from "#controllers/auth/login/login.validation.js";

import { logout } from "#controllers/auth/logout/logout.controller.js";
import { demoLogin } from "#controllers/auth/demo/demo.controller.js";

// ---------------------------------------------------------------------------
// 📂 SECURITY, ROTATION & VERIFICATION CONTROLLERS
// ---------------------------------------------------------------------------
import { refreshToken } from "#controllers/auth/refreshTokens/refreshToken.controller.js";

import { verifyEmail } from "#controllers/auth/verifyEmail/verifyEmail.controller.js";
import { VerifyEmailSchema } from "#controllers/auth/verifyEmail/verifyEmail.validation.js";

// ---------------------------------------------------------------------------
// 📂 ACCOUNT RECOVERY CONTROLLERS
// ---------------------------------------------------------------------------
import { forgotPassword } from "#controllers/auth/forgotPassword/forgotPassword.controller.js";
import { ForgotPasswordSchema } from "#controllers/auth/forgotPassword/forgotPassword.validation.js";

import { resetPassword } from "#controllers/auth/resetPassword/resetPassword.controller.js";
import { ResetPasswordSchema } from "#controllers/auth/resetPassword/resetPassword.validation.js";

// ---------------------------------------------------------------------------
// 📂 FEDERATED OAUTH IDENTITY CONTROLLERS
// ---------------------------------------------------------------------------
import { googleLogin } from "#controllers/auth/oAuth/google/google.controller.js";
import { GoogleAuthSchema } from "#controllers/auth/oAuth/google/google.validation.js";

const router = Router();

// =============================================================================
// 🔓 PUBLIC AUTHENTICATION ENDPOINTS
// =============================================================================

// Traditional Registration & Credential Login
router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);

// ⚡ 1-Click Instant Showcase Evaluator Pass
router.post("/demo", demoLogin);

// Federated Identity Provider Exchange Gateway
router.post("/google", validate(GoogleAuthSchema), googleLogin);

// Core Token Maintenance Lifecycles
router.post("/refresh", refreshToken);
router.post("/verify-email", validate(VerifyEmailSchema), verifyEmail);

// Account Access Restorations
router.post("/forgot-password", validate(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

// =============================================================================
// 🔒 PROTECTED AUTHENTICATION ENDPOINTS
// =============================================================================

router.post("/logout", logout);

export default router;
