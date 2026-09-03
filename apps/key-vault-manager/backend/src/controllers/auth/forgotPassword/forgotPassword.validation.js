// server/controllers/forgotPassword/forgotPassword.validation.js

import { z } from "zod";
import { baseEmailField } from "#validations/shared.validation.js";

/**
 * Validation schema for processing request payloads against the /forgot-password endpoint.
 */
export const ForgotPasswordSchema = z.object({
  body: z
    .object({
      // Consumes your pre-configured, hardened email field with its disposable filters
      email: baseEmailField,
    })
    .strict(),
});
