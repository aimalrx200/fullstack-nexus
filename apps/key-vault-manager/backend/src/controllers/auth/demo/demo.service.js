// apps/key-vault-manager/backend/src/controllers/auth/demo/demo.service.js

import crypto from "crypto";
import User from "#models/User.js";
import Session from "#models/Session.js";
import { generateTokens } from "#services/generateTokens.js";
import { sessionCache } from "#utils/sessionCache.js";
import { seedInitialVaultData } from "#services/vaultSeedService.js";
import {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "#config/time.constants.js";

const DEMO_USER_CONFIG = {
  email: "demo@keyvault.io",
  username: "demo_evaluator",
  name: "Lead Security Auditor",
  role: "administrator",
  isVerified: true,
};

/**
 * Finds or self-provisions the verified evaluator demo account.
 */
export const getOrCreateDemoUser = async () => {
  let user = await User.findOne({ email: DEMO_USER_CONFIG.email });

  if (!user) {
    user = await User.create({
      ...DEMO_USER_CONFIG,
      password: `VaultDemo_${crypto.randomBytes(8).toString("hex")}!#`,
    });
  }

  // Ensure default demo secrets & audit logs are seeded for this demo account
  await seedInitialVaultData(user._id, user.name || user.username);

  return user;
};

/**
 * Provisions a fresh, active session context across MongoDB and Redis.
 */
export const initializeDemoSession = async ({
  user,
  clientInstanceId,
  deviceInfo,
  ipAddress,
}) => {
  const tokenFamilyId = crypto.randomBytes(16).toString("hex");
  const initialVersion = 0;
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const { accessToken, refreshToken } = generateTokens(
    user,
    tokenFamilyId,
    initialVersion,
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await Promise.all([
    Session.create({
      userId: user._id,
      tokenFamilyId,
      tokenHash,
      tokenVersion: initialVersion,
      deviceInfo,
      ipAddress,
      clientInstanceId,
      expiresAt,
    }),
    sessionCache.setex(
      `session:${tokenFamilyId}`,
      REFRESH_TOKEN_TTL_SECONDS,
      String(initialVersion),
    ),
  ]);

  return { accessToken, refreshToken };
};
