// /server/routes/root.route.js

import { Router } from "express";
import { home } from "#controllers/auth/root/root.controller.js";

const router = Router();

router.get("/", home);

export default router;
