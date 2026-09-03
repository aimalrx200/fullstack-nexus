// apps/key-vault-manager/backend/src/services/vaultSeedService.js

import crypto from "crypto";
import Secret from "#models/Secret.js";
import AuditLog from "#models/AuditLog.js";
import { encryptSecret } from "#utils/cryptoVault.js";
import { logger } from "#config/logger.js";

const DEFAULT_SAMPLE_SECRETS = [
  {
    namespace: "Production",
    name: "AWS_PRODUCTION_ACCESS_KEY",
    engine: "KV v2",
    type: "Static",
    status: "Healthy",
    ttl: "Infinite",
    plaintext: "AKIA_PROD_SECURE_VAULT_KEY_8492049",
    allowedActions: ["rotate", "sdk"],
  },
  {
    namespace: "Production",
    name: "POSTGRES_MASTER_PASSWORD",
    engine: "PostgreSQL",
    type: "Dynamic",
    status: "Healthy",
    ttl: "24h remaining",
    plaintext: "pg_master_pass_902jf83h20ndks!@#",
    allowedActions: ["renew", "revoke", "rotate"],
  },
  {
    namespace: "Production",
    name: "STRIPE_LIVE_API_SECRET",
    engine: "KV v2",
    type: "Static",
    status: "Expiring",
    ttl: "2h left",
    plaintext: "mock_stripe_secret_key_sample_9842048fj",
    allowedActions: ["rotate", "sdk"],
  },
  {
    namespace: "Staging",
    name: "REDIS_CLUSTER_AUTH_TOKEN",
    engine: "Redis DB",
    type: "Dynamic",
    status: "Healthy",
    ttl: "48h remaining",
    plaintext: "redis_stage_token_398fhkjsd9834",
    allowedActions: ["renew", "revoke"],
  },
  {
    namespace: "Development",
    name: "LOCAL_DEV_JWT_SECRET",
    engine: "Transit",
    type: "Static",
    status: "Healthy",
    ttl: "Infinite",
    plaintext: "super_secret_local_dev_token_098234",
    allowedActions: ["rotate", "sdk"],
  },
];

/**
 * Automatically seeds an initial set of encrypted sample secrets and audit logs for a user.
 */
export const seedInitialVaultData = async (
  userId,
  userIdentifier = "Operator",
) => {
  try {
    const existingCount = await Secret.countDocuments({ userId });
    if (existingCount > 0) return; // Already seeded

    const secretDocs = DEFAULT_SAMPLE_SECRETS.map((item) => {
      const encrypted = encryptSecret(item.plaintext);
      return {
        userId,
        namespace: item.namespace,
        name: item.name,
        engine: item.engine,
        type: item.type,
        status: item.status,
        ttl: item.ttl,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        allowedActions: item.allowedActions,
      };
    });

    await Secret.insertMany(secretDocs);

    // Seed an initial audit event
    await AuditLog.create({
      userId,
      event: "VAULT_INITIALIZED",
      eventType: "write",
      principal: userIdentifier,
      principalType: "user",
      targetPath: "sys/init",
      status: "PASS",
      requestId: crypto.randomUUID(),
    });

    logger.info({
      msg: "🔐 Vault sample secrets initialized & encrypted successfully",
      userId,
    });
  } catch (error) {
    logger.error({
      msg: "Failed to seed default vault data",
      userId,
      error: error.message,
    });
  }
};
