// apps/key-vault-manager/backend/src/models/AuditLog.js

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true, // e.g. 'SECRET_READ', 'SECRET_CREATED', 'KEY_ROTATED'
    },
    eventType: {
      type: String,
      enum: ["read", "write", "rotate", "deny", "refresh"],
      default: "read",
    },
    principal: {
      type: String,
      required: true,
    },
    principalType: {
      type: String,
      enum: ["user", "machine"],
      default: "user",
    },
    targetPath: {
      type: String,
      required: true,
    },
    clientIp: {
      type: String,
      default: "127.0.0.1",
    },
    status: {
      type: String,
      enum: ["PASS", "DROP"],
      default: "PASS",
    },
    requestId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// High-speed index for audit querying & timestamp chronological ordering
auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
