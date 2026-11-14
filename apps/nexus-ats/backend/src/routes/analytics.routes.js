import { Router } from "express";
import { getOverviewAnalytics } from "#controllers/analytics/analytics.controller.js";
import { protectRecruiter } from "#middlewares/authMiddleware.js";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", protectRecruiter, getOverviewAnalytics);
