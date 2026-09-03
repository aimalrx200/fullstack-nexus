// server/controllers/verifyEmail/verifyEmail.validation.js

import { z } from "zod";

/**
 * Validation schema for checking token payloads against the /verify-email endpoint.
 */
export const VerifyEmailSchema = z.object({
  body: z
    .object({
      token: z
        .string({ message: "This link appears to be broken or incomplete." })
        .trim()
        .min(1, { message: "This link appears to be broken or incomplete." }),
    })
    .strict(),
});
