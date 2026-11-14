import { Router } from "express";
import {
  demoLogin,
  login,
  getMe,
  logout,
} from "#controllers/auth/auth.controller.js";
import { protectRecruiter } from "#middlewares/authMiddleware.js";
import { validate } from "#middlewares/validate.js";
import { authRateLimiter } from "#config/rateLimiter.js";
import { loginSchema } from "#validations/auth.validation.js";

export const authRouter = Router();

authRouter.post("/demo", demoLogin);
authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.get("/me", protectRecruiter, getMe);
authRouter.post("/logout", protectRecruiter, logout);
