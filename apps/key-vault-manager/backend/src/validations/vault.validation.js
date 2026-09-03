// apps/key-vault-manager/backend/src/validations/vault.validation.js

import { z } from "zod";

const validEngines = [
  "KV v2",
  "PostgreSQL",
  "PKI Certs",
  "PKI",
  "Redis DB",
  "Transit",
  "AWS STS",
  "MongoDB",
];

export const CreateSecretSchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: "Secret name is required." })
        .trim()
        .min(2, "Secret name must be at least 2 characters.")
        .max(100, "Secret name must not exceed 100 characters.")
        .regex(
          /^[A-Za-z0-9_-]+$/,
          "Secret name can only contain letters, numbers, hyphens, and underscores (no spaces).",
        ),
      namespace: z
        .enum(["Production", "Staging", "Development"])
        .default("Production"),
      engine: z
        .string()
        .refine((val) => validEngines.includes(val), {
          message:
            'Invalid engine option. Expected one of "KV v2", "PostgreSQL", "PKI Certs", "Redis DB", "Transit", "AWS STS", or "MongoDB".',
        })
        .transform((val) => (val === "PKI" ? "PKI Certs" : val))
        .default("KV v2"),
      type: z.enum(["Static", "Dynamic", "Certificate"]).default("Static"),
      value: z
        .string({ message: "Plaintext value is required." })
        .min(1, "Secret value cannot be empty."),
      ttl: z.string().default("Infinite"),
    })
    .strict(),
});

export const RotateSecretSchema = z.object({
  body: z
    .object({
      newValue: z.string().optional(),
    })
    .strict(),
  params: z.object({
    id: z.string().min(1, "Secret ID is required."),
  }),
});
