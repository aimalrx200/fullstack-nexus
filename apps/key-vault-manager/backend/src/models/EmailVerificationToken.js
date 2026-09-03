// server/models/EmailVerificationToken.js

import mongoose from "mongoose";
import { EMAIL_VERIFICATION_TOKEN_TTL_SECONDS } from "#config/time.constants.js";

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

// 🧼 Native TTL Indexing using your centralized source of truth parameter
emailVerificationTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: EMAIL_VERIFICATION_TOKEN_TTL_SECONDS },
);

const EmailVerificationToken = mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema,
);

export default EmailVerificationToken;
