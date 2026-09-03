// server/controllers/resetPassword/resetPassword.validation.js

import { z } from "zod";
import {
  basePasswordStructuralSchema,
  applyPasswordStrengthCheck,
} from "#validations/shared.validation.js";

/**
 * Validation schema for updating user authentication credentials against the /reset-password endpoint.
 */
export const ResetPasswordSchema = z.object({
  body: z
    .object({
      token: z
        .string({ message: "This link appears to be broken or incomplete." })
        .trim()
        .min(1, { message: "This link appears to be broken or incomplete." }),

      // Layer 1: Structural Rules (Identical to your Registration criteria)
      password: basePasswordStructuralSchema,
    })
    .strict()
    // Layer 2: Entropy check via your custom checkPasswordStrength utility
    .superRefine((data, ctx) => {
      const { password } = data;

      // For password resets, we don't have username/email access in the request body
      // to penalize contextual terms, so we run the baseline dictionary filter.
      applyPasswordStrengthCheck(password, [], ctx);
    }),
});
