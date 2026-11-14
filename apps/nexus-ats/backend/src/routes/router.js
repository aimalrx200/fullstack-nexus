import { Router } from "express";
import { rootRouter } from "./root.route.js";
import { authRouter } from "./auth.routes.js";
import { jobRouter } from "./job.routes.js";
import { candidateRouter } from "./candidate.routes.js";
import { analyticsRouter } from "./analytics.routes.js";

export const router = Router();

// Health & Uptime
router.use("/", rootRouter);

// Domain Route Modules
router.use("/auth", authRouter);
router.use("/jobs", jobRouter);
router.use("/candidates", candidateRouter);
router.use("/analytics", analyticsRouter);
