import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

const cleanUrl = z
  .string()
  .url()
  .transform((val) => val.replace(/\/$/, ""));

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CLIENT_URL: cleanUrl.default("http://localhost:5175"),
  MONGO_URI: z.string().url("MONGO_URI must be a valid MongoDB protocol URL."),

  // Cryptographic Signatures (Min 32 characters)
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long."),
  REFRESH_SECRET: z
    .string()
    .min(32, "REFRESH_SECRET must be at least 32 characters long."),
  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters long."),

  // Token Lifespans
  ACCESS_TOKEN_EXPIRY_DEV: z.coerce.number().default(15),
  REFRESH_TOKEN_EXPIRY_DEV: z.coerce.number().default(1440),
  ACCESS_TOKEN_EXPIRY_PROD: z.coerce.number().default(15),
  REFRESH_TOKEN_EXPIRY_PROD: z.coerce.number().default(7),
  INVENTORY_HOLD_TTL_SECONDS: z.coerce.number().default(600),

  // Upstash Redis
  REDIS_URL: z.string().url().or(z.literal("")).optional(),

  // Google Maps SDK
  GOOGLE_MAPS_API_KEY: z.string().optional().or(z.literal("")),

  // WebAuthn / Passkeys
  RP_NAME: z.string().default("Nexus Commerce"),
  RP_ID: z.string().default("localhost"),
  ORIGIN: cleanUrl.default("http://localhost:5175"),

  // Google OAuth 2.0 PKCE
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal("")),

  // Payment Gateways
  STRIPE_SECRET_KEY: z.string().default("sk_test_placeholder_key"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_placeholder_webhook_secret"),

  JAZZCASH_MERCHANT_ID: z.string().optional().or(z.literal("")),
  JAZZCASH_PASSWORD: z.string().optional().or(z.literal("")),
  JAZZCASH_INTEGRITY_SALT: z.string().optional().or(z.literal("")),
  JAZZCASH_RETURN_URL: cleanUrl.default(
    "http://localhost:4000/api/v1/payments/jazzcash/callback",
  ),

  EASYPAISA_STORE_ID: z.string().optional().or(z.literal("")),
  EASYPAISA_HASH_KEY: z.string().optional().or(z.literal("")),
  EASYPAISA_RETURN_URL: cleanUrl.default(
    "http://localhost:4000/api/v1/payments/easypaisa/callback",
  ),

  // Cloudinary Media Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),

  // Transactional Email
  SMTP_HOST: z.string().default("smtp.ethereal.email"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASS: z.string().optional().or(z.literal("")),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingFields = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    logger.fatal({
      msg: "❌ Critical Environment Configuration Failure. Startup aborted.",
      invalidFields: missingFields,
    });
    process.exit(1);
  }
  throw error;
}

export default env;
