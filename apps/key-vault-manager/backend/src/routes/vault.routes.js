// apps/key-vault-manager/backend/src/routes/vault.routes.js

import { Router } from "express";
import { validate } from "#middlewares/validate.js";
import {
  getSecrets,
  revealSecret,
  createSecret,
  rotateSecret,
  renewLease,
  revokeLease,
  deleteSecret,
  getAuditLogs,
  resetDemoVault,
  simulateAttack,
} from "#controllers/vault/vault.controller.js";
import {
  CreateSecretSchema,
  RotateSecretSchema,
} from "#validations/vault.validation.js";

const router = Router();

// Secrets Management
router.get("/secrets", getSecrets);
router.get("/secrets/:id/reveal", revealSecret);
router.post("/secrets", validate(CreateSecretSchema), createSecret);
router.post("/secrets/:id/rotate", validate(RotateSecretSchema), rotateSecret);
router.post("/secrets/:id/renew", renewLease);
router.post("/secrets/:id/revoke", revokeLease);
router.delete("/secrets/:id", deleteSecret);

// Compliance & Telemetry
router.get("/audit-logs", getAuditLogs);
router.post("/reset-demo", resetDemoVault);
router.post("/simulate-attack", simulateAttack);

export default router;
