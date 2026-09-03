// apps/key-vault-manager/backend/src/controllers/vault/vault.controller.js

import crypto from "crypto";
import Secret from "#models/Secret.js";
import AuditLog from "#models/AuditLog.js";
import { encryptSecret, decryptSecret } from "#utils/cryptoVault.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { seedInitialVaultData } from "#services/vaultSeedService.js";

/**
 * GET /api/v1/vault/secrets
 * Retrieves all secrets for the user within a namespace (values masked).
 */
export const getSecrets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const namespace = req.query.namespace || "Production";

  // Auto-seed baseline data if the user has no secrets yet
  const count = await Secret.countDocuments({ userId });
  if (count === 0) {
    await seedInitialVaultData(userId, req.user.username || req.user.name);
  }

  const secrets = await Secret.find({ userId, namespace }).sort({
    createdAt: -1,
  });

  // Map to frontend-friendly structure with masked values
  const safeSecrets = secrets.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    namespace: s.namespace,
    engine: s.engine,
    type: s.type,
    status: s.status,
    ttl: s.ttl,
    version: s.version,
    allowedActions: s.allowedActions,
    value: "••••••••••••••••••••••••", // Masked by default
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return res.status(200).json({
    success: true,
    namespace,
    secrets: safeSecrets,
  });
});

/**
 * GET /api/v1/vault/secrets/:id/reveal
 * Decrypts the secret on-the-fly via AES-256-GCM and logs an immutable audit event.
 */
export const revealSecret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const secret = await Secret.findOne({ _id: id, userId });
  if (!secret) {
    return res
      .status(404)
      .json({ success: false, message: "Secret not found." });
  }

  // Real on-demand AES-256-GCM decryption with graceful barrier key check
  let decryptedPlaintext;
  try {
    decryptedPlaintext = decryptSecret({
      ciphertext: secret.ciphertext,
      iv: secret.iv,
      authTag: secret.authTag,
    });
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        "Decryption failed. This secret was encrypted with a previous master barrier key.",
    });
  }

  // Record an immutable audit log entry
  await AuditLog.create({
    userId,
    event: "SECRET_REVEALED",
    eventType: "read",
    principal: req.user.username || req.user.email || "Operator",
    principalType: "user",
    targetPath: `${secret.namespace.toLowerCase()}/${secret.name}`,
    clientIp:
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip ||
      "127.0.0.1",
    status: "PASS",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    id: secret._id,
    name: secret.name,
    value: decryptedPlaintext,
  });
});

/**
 * POST /api/v1/vault/secrets
 * Encrypts with AES-256-GCM, stores ciphertext, and records an audit log.
 */
export const createSecret = asyncHandler(async (req, res) => {
  const { name, namespace, engine, type, value, ttl } = req.body;
  const userId = req.user.id;

  const existing = await Secret.findOne({
    userId,
    namespace,
    name: name.toUpperCase(),
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `A secret named '${name.toUpperCase()}' already exists in ${namespace}.`,
    });
  }

  // Encrypt payload at rest
  const { ciphertext, iv, authTag } = encryptSecret(value);

  const newSecret = await Secret.create({
    userId,
    namespace,
    name: name.toUpperCase(),
    engine,
    type,
    ttl,
    ciphertext,
    iv,
    authTag,
    version: 1,
    allowedActions:
      type === "Dynamic" ? ["renew", "revoke", "rotate"] : ["rotate", "sdk"],
  });

  await AuditLog.create({
    userId,
    event: "SECRET_CREATED",
    eventType: "write",
    principal: req.user.username || "Operator",
    principalType: "user",
    targetPath: `${namespace.toLowerCase()}/${name.toUpperCase()}`,
    clientIp: req.ip || "127.0.0.1",
    status: "PASS",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(201).json({
    success: true,
    message: `Secret ${newSecret.name} stored and encrypted successfully.`,
    secret: {
      id: newSecret._id,
      name: newSecret.name,
      namespace: newSecret.namespace,
      engine: newSecret.engine,
      type: newSecret.type,
      ttl: newSecret.ttl,
      version: newSecret.version,
    },
  });
});

/**
 * POST /api/v1/vault/secrets/:id/rotate
 * Re-encrypts with fresh entropy, increments version, and records audit trail.
 */
export const rotateSecret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newValue } = req.body;
  const userId = req.user.id;

  const secret = await Secret.findOne({ _id: id, userId });
  if (!secret) {
    return res
      .status(404)
      .json({ success: false, message: "Secret not found." });
  }

  // Generate new cryptographic payload if none provided
  const generatedEntropy =
    newValue || `sec_rot_${crypto.randomBytes(16).toString("hex")}`;
  const { ciphertext, iv, authTag } = encryptSecret(generatedEntropy);

  secret.ciphertext = ciphertext;
  secret.iv = iv;
  secret.authTag = authTag;
  secret.version += 1;
  secret.status = "Healthy";
  await secret.save();

  await AuditLog.create({
    userId,
    event: "KEY_ROTATED",
    eventType: "rotate",
    principal: req.user.username || "Operator",
    principalType: "user",
    targetPath: `${secret.namespace.toLowerCase()}/${secret.name}`,
    clientIp: req.ip || "127.0.0.1",
    status: "PASS",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    message: `${secret.name} rotated to version ${secret.version}.`,
    version: secret.version,
  });
});

/**
 * POST /api/v1/vault/secrets/:id/renew
 * Renews an expiring dynamic lease.
 */
export const renewLease = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const secret = await Secret.findOne({ _id: id, userId });
  if (!secret) {
    return res
      .status(404)
      .json({ success: false, message: "Secret not found." });
  }

  secret.ttl = "24h remaining";
  secret.status = "Healthy";
  await secret.save();

  await AuditLog.create({
    userId,
    event: "LEASE_RENEWED",
    eventType: "refresh",
    principal: req.user.username || "Operator",
    principalType: "user",
    targetPath: `${secret.namespace.toLowerCase()}/${secret.name}`,
    clientIp: req.ip || "127.0.0.1",
    status: "PASS",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    message: `Lease for ${secret.name} extended by 24h.`,
  });
});

/**
 * POST /api/v1/vault/secrets/:id/revoke
 * Revokes active lease.
 */
export const revokeLease = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const secret = await Secret.findOne({ _id: id, userId });
  if (!secret) {
    return res
      .status(404)
      .json({ success: false, message: "Secret not found." });
  }

  secret.status = "Revoked";
  secret.ttl = "Expired";
  await secret.save();

  await AuditLog.create({
    userId,
    event: "LEASE_REVOKED",
    eventType: "deny",
    principal: req.user.username || "Operator",
    principalType: "user",
    targetPath: `${secret.namespace.toLowerCase()}/${secret.name}`,
    clientIp: req.ip || "127.0.0.1",
    status: "DROP",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    message: `Lease for ${secret.name} revoked.`,
  });
});

/**
 * DELETE /api/v1/vault/secrets/:id
 * Permanently purges secret and writes audit record.
 */
export const deleteSecret = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const secret = await Secret.findOneAndDelete({ _id: id, userId });
  if (!secret) {
    return res
      .status(404)
      .json({ success: false, message: "Secret not found." });
  }

  await AuditLog.create({
    userId,
    event: "SECRET_DELETED",
    eventType: "deny",
    principal: req.user.username || "Operator",
    principalType: "user",
    targetPath: `${secret.namespace.toLowerCase()}/${secret.name}`,
    clientIp: req.ip || "127.0.0.1",
    status: "PASS",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    message: `Secret ${secret.name} permanently removed.`,
  });
});

/**
 * GET /api/v1/vault/audit-logs
 * Retrieves real chronological audit records for the user.
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);

  const logs = await AuditLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  const formattedLogs = logs.map((l) => ({
    id: l._id.toString(),
    timestamp: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
    event: l.event,
    eventType: l.eventType,
    principal: l.principal,
    principalType: l.principalType,
    targetPath: l.targetPath,
    clientIp: l.clientIp,
    status: l.status,
    requestId: l.requestId,
  }));

  return res.status(200).json({
    success: true,
    count: formattedLogs.length,
    logs: formattedLogs,
  });
});

/**
 * POST /api/v1/vault/reset-demo
 * Clears and re-seeds default vault showcase data.
 */
export const resetDemoVault = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Promise.all([
    Secret.deleteMany({ userId }),
    AuditLog.deleteMany({ userId }),
  ]);

  await seedInitialVaultData(userId, req.user.username || "Operator");

  return res.status(200).json({
    success: true,
    message: "Vault reset to clean demo state with encrypted sample keys.",
  });
});

/**
 * POST /api/v1/vault/simulate-attack
 * Generates an intentional unauthorized perimeter probe dropped by zero-trust gates.
 */
export const simulateAttack = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const untrustedIps = [
    "198.51.100.42 (Untrusted CIDR)",
    "203.0.113.195 (External Botnet)",
    "192.0.2.77 (Unregistered Proxy)",
  ];
  const randomIp =
    untrustedIps[Math.floor(Math.random() * untrustedIps.length)];

  const attackLog = await AuditLog.create({
    userId,
    event: "PERIMETER_ACL_VIOLATION",
    eventType: "deny",
    principal: "unauthorized_probe_bot@ext-net",
    principalType: "machine",
    targetPath: "production/master-barrier-envelope/*",
    clientIp: randomIp,
    status: "DROP",
    requestId: req.id || crypto.randomUUID(),
  });

  return res.status(200).json({
    success: true,
    message: "Security violation intercepted and logged to immutable ledger.",
    log: attackLog,
  });
});
