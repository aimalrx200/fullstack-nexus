// server/models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The Token Family ID groups rotated refresh tokens together to catch reuse/replay attacks
    tokenFamilyId: {
      type: String,
      required: true,
      unique: true, // Unique index constraint for family tracking boundaries
    },
    // SHA-256 hash of the outstanding refresh token JWT.
    tokenHash: {
      type: String,
      required: true,
    },
    // Tracks token rotations within this specific device session
    tokenVersion: {
      type: Number,
      default: 0,
    },
    // Production Metadata: Helps users view and manage their active devices
    deviceInfo: {
      type: String,
      default: "Unknown Device",
    },
    ipAddress: {
      type: String,
      default: "Unknown IP",
    },
    // ✅ FIXED: Support client-side sandbox isolation tracking (Incognito vs Normal tab separation)
    clientInstanceId: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    // The exact expiration timestamp matching the Refresh Token lifetime
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// ---------------------------------------------------------------------------
// 📈 Production Database Index Optimization Layer
// ---------------------------------------------------------------------------

// Native TTL index automatically purges expired sessions from MongoDB collections
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound Index for ultra-fast session validation during token rotation gates
sessionSchema.index({ tokenFamilyId: 1, isRevoked: 1 });

// ✅ FIXED: New Compound Index optimized directly for Option B client-sandbox session lookups
sessionSchema.index(
  { userId: 1, clientInstanceId: 1, isRevoked: 1 },
  { sparse: true },
);

// ✅ RETAINED: Legacy/Fallback Compound Index optimized for standard User-Agent cleanups or profile list lookups
sessionSchema.index({ userId: 1, deviceInfo: 1, isRevoked: 1 });

export default mongoose.model("Session", sessionSchema);
