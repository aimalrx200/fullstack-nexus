// server/models/User.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import { UNVERIFIED_ACCOUNT_PURGE_TTL_SECONDS } from "#config/time.constants.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [60, "Name must not exceed 60 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please fill a valid email address"],
    },
    password: {
      type: String,
      // 🔒 CONDITIONAL VALIDATION: Required only if the user is not registering via Google OAuth
      required: [
        function () {
          return !this.googleId;
        },
        "Password is required",
      ],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // 🚀 CRITICAL: Allows standard credential accounts to have a null/missing googleId without throwing duplicate key errors
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "administrator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-hash password before saving
UserSchema.pre("save", async function () {
  // If there's no password field (Google user), skip hashing logic entirely
  if (!this.password || !this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to verify passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // Prevent bcrypt errors on exclusive OAuth accounts
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---------------------------------------------------------------------------
// 📈 Production Database Index & Lifecycle Optimization Layer
// ---------------------------------------------------------------------------

// Automatically purges abandoned registrations using your centralized source of truth
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: UNVERIFIED_ACCOUNT_PURGE_TTL_SECONDS,
    partialFilterExpression: { isVerified: false },
  },
);

const User = mongoose.model("User", UserSchema);

export default User;
