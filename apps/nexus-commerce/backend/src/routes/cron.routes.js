import { Router } from "express";
import { handleInventoryReconciliationCron } from "#controllers/cron/cron.controller.js";

const router = Router();

// Endpoint: GET or POST /api/v1/cron/reconcile
router.get("/reconcile", handleInventoryReconciliationCron);
router.post("/reconcile", handleInventoryReconciliationCron);

export default router;
