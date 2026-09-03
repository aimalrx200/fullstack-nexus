// apps/key-vault-manager/backend/src/utils/cryptoVault.js

import crypto from "crypto";
import env from "#config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit standard initialization vector for GCM
const KEY_LENGTH = 32; // 256-bit key

/**
 * Derives a deterministic 256-bit master barrier key using scrypt.
 */
const getMasterBarrierKey = () => {
  return crypto.scryptSync(
    env.JWT_SECRET,
    "vault_master_barrier_salt_v1",
    KEY_LENGTH,
  );
};

/**
 * Encrypts a plaintext secret with AES-256-GCM AEAD encryption.
 * @param {string} plaintext - Unencrypted secret string
 * @returns {{ ciphertext: string, iv: string, authTag: string }}
 */
export const encryptSecret = (plaintext) => {
  if (typeof plaintext !== "string") {
    throw new Error("Secret plaintext must be a string.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterBarrierKey(), iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

/**
 * Decrypts an AES-256-GCM encrypted payload and verifies integrity.
 * @param {{ ciphertext: string, iv: string, authTag: string }} payload
 * @returns {string} Decrypted plaintext string
 */
export const decryptSecret = ({ ciphertext, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getMasterBarrierKey(),
    Buffer.from(iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
