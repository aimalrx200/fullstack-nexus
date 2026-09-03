// /apps/key-vault-manager/backend/src/config/env.js

import { z } from "zod";
import dotenv from "dotenv";
import { logger } from "./logger.js";

// Load local environmental context variants
dotenv.config();

const envSchema = z.object({
  CLIENT_URL: z
    .string({ message: "CLIENT_URL is required." })
    .url("CLIENT_URL must be a valid URL string."),
  PORT: z.string().default("3000"),
  MONGO_URI: z
    .string({ message: "MONGO_URI connection string is required." })
    .url("MONGO_URI must be a valid database protocol URL."),
  JWT_SECRET: z
    .string()
    .min(
      32,
      "JWT_SECRET must be a cryptographically strong string at least 32 characters long.",
    ),
  REFRESH_SECRET: z
    .string()
    .min(
      32,
      "REFRESH_SECRET must be a cryptographically strong string at least 32 characters long.",
    ),
  COOKIE_SECRET: z
    .string()
    .min(
      32,
      "COOKIE_SECRET must be a cryptographically strong string at least 32 characters long.",
    ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ACCESS_TOKEN_EXPIRY_DEV: z.coerce.number().default(1),
  REFRESH_TOKEN_EXPIRY_DEV: z.coerce.number().default(2),
  ACCESS_TOKEN_EXPIRY_PROD: z.coerce.number().default(15),
  REFRESH_TOKEN_EXPIRY_PROD: z.coerce.number().default(7),

  // Safely filters out empty string placeholders before parsing
  REDIS_URL: z
    .string()
    .url("REDIS_URL must be a valid protocol URL.")
    .or(z.literal(""))
    .optional(),

  EMAIL_VERIFICATION_TOKEN_TTL: z.coerce.number().default(86400),

  // ===========================================================================
  // 📧 FIXED: SMTP BOUNDARY VALIDATION STRATEGY
  // ===========================================================================
  SMTP_HOST: z.string().default("smtp.ethereal.email"), // Clean developer fallback baseline
  SMTP_PORT: z.coerce.number().default(587), // Safely converts string representation "587" into a pure integer
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((val) => val === "true"), // Seamlessly converts string flags to pure booleans
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASS: z.string().optional().or(z.literal("")),

  // ===========================================================================
  // 🌐 GOOGLE OAUTH DATA SCHEMATIC REGULATION
  // ===========================================================================
  GOOGLE_CLIENT_ID: z.string({
    message:
      "GOOGLE_CLIENT_ID identity claim is required for OAuth operations.",
  }),
  GOOGLE_CLIENT_SECRET: z.string({
    message: "GOOGLE_CLIENT_SECRET signature is required for server exchanges.",
  }),
});

let env;

try {
  // Parse configurations safely
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingFields = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    logger.fatal({
      msg: "❌ Invalid application environment configuration parameters. Real-time startup aborted.",
      invalidFields: missingFields,
    });

    // Crash the process immediately since the app cannot run without structural configs
    process.exit(1);
  }
  throw error;
}

export default env;
