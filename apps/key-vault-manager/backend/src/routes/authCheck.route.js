// /server/routes/authCheck.route.js

import { Router } from "express";
import { authCheck } from "#controllers/auth/authCheck/authCheck.controller.js";

const router = Router();

router.get("/auth-check", authCheck);

export default router;
