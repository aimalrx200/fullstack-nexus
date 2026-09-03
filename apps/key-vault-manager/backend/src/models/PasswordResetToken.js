// server/models/PasswordResetToken.js

import mongoose from "mongoose";
import { PASSWORD_RESET_TOKEN_TTL_SECONDS } from "#config/time.constants.js";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 🔒 INDUSTRY STANDARD: Stores ONLY a SHA-256 cryptographic hash of the raw token.
    // If the database is completely breached, attackers cannot use the hashes to
    // reset passwords since the raw entropy string remains strictly out-of-band (in the email).
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    // Explicitly configure timestamps to match your Session/User convention,
    // which provides critical visibility for internal account security auditing logs.
    timestamps: true,
    versionKey: false,
  },
);

// ---------------------------------------------------------------------------
// 📈 Production Database Index & Lifecycle Optimization Layer
// ---------------------------------------------------------------------------

// ⏱️ HARDENED NATIVE TTL INDEX:
// Forces MongoDB to automatically evict and purge this document using your
// centralized source of truth parameter.
passwordResetTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: PASSWORD_RESET_TOKEN_TTL_SECONDS }, // 🧼 Centralized!
);

// 🚀 HIGH-SPEED PERFORMANCE INDEX:
// When a user requests a forgot password link *again* before the first one expires,
// the controller deletes old tokens first. This index ensures that lookups and
// cleanups matching that user complete instantaneously.
passwordResetTokenSchema.index({ userId: 1 });

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema,
);

export default PasswordResetToken;
