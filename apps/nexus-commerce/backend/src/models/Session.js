import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenFamilyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    deviceInfo: {
      type: String,
      default: "Unknown Browser",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    clientInstanceId: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Native TTL index: MongoDB automatically purges expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast session validation
sessionSchema.index({ tokenFamilyId: 1, isRevoked: 1 });

export default mongoose.model("Session", sessionSchema);
