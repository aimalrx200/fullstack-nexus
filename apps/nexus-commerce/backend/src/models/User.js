// apps/nexus-commerce/backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const passkeySchema = new mongoose.Schema(
  {
    credentialID: {
      type: String,
      required: true,
    },
    credentialPublicKey: {
      type: Buffer,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    deviceType: {
      type: String,
      default: "singleDevice",
    },
    backedUp: {
      type: Boolean,
      default: false,
    },
    transports: {
      type: [String],
      default: ["internal", "hybrid"],
    },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    isDefault: { type: Boolean, default: false },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "Pakistan" },
    countryCode: { type: String, required: true, default: "PK" },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "support_agent", "merchant_admin", "super_admin"],
      default: "customer",
      index: true,
    },
    isProtected: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDemoAccount: {
      type: Boolean,
      default: false,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    passkeys: {
      type: [passkeySchema],
      default: [],
    },
    currentChallenge: {
      type: String,
      select: false,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index(
  { "passkeys.credentialID": 1 },
  { unique: true, sparse: true },
);

userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
