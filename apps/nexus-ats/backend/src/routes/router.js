import { Router } from "express";
import { rootRouter } from "./root.route.js";

export const router = Router();

// Root health check mounted on /api/v1
router.use("/", rootRouter);

// Domain route modules will be plugged in here in subsequent steps:
// router.use("/auth", authRouter);
// router.use("/jobs", jobRouter);
// router.use("/candidates", candidateRouter);
// router.use("/analytics", analyticsRouter);
