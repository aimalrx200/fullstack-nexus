// apps/key-vault-manager/backend/src/routes/router.js

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import authCheckRoute from "./authCheck.route.js";
import homeRoute from "./root.route.js";
import vaultRoutes from "./vault.routes.js"; // 👈 1. Import vault routes
import { authMiddleware } from "#middlewares/authMiddleware.js";

const router = Router();

// 1. PUBLIC ROUTES
router.use("/auth", authRoutes);
router.use("/", homeRoute);

// 2. PROTECTED ROUTES (Require Login)
router.use("/check", authMiddleware, authCheckRoute);
router.use("/vault", authMiddleware, vaultRoutes); // 👈 2. Mount protected vault endpoints

export default router;
