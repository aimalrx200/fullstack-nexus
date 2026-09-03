// apps/key-vault-manager/backend/src/models/Secret.js

import mongoose from "mongoose";

const secretSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    namespace: {
      type: String,
      enum: ["Production", "Staging", "Development"],
      default: "Production",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Secret name is required"],
      trim: true,
    },
    engine: {
      type: String,
      default: "KV v2",
      enum: [
        "KV v2",
        "PostgreSQL",
        "PKI Certs",
        "Redis DB",
        "Transit",
        "AWS STS",
        "MongoDB",
      ],
    },
    type: {
      type: String,
      enum: ["Static", "Dynamic", "Certificate"],
      default: "Static",
    },
    status: {
      type: String,
      enum: ["Healthy", "Expiring", "Revoked"],
      default: "Healthy",
    },
    ttl: {
      type: String,
      default: "Infinite",
    },

    // 🔒 Cryptographic Payload (Never stored in plaintext)
    ciphertext: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },
    allowedActions: {
      type: [String],
      default: ["rotate", "sdk", "renew", "revoke"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique secret names per user and namespace
secretSchema.index({ userId: 1, namespace: 1, name: 1 }, { unique: true });

export default mongoose.model("Secret", secretSchema);
