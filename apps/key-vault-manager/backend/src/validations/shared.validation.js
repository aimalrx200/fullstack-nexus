// server/validations/shared.validation.js

import { z } from "zod";
import { isDisposableEmail } from "disposable-email-domains-js";
import {
  checkPasswordStrength,
  MIN_PASSWORD_SCORE,
} from "#utils/passwordStrength.js";

export const usernameRegex = /^[a-zA-Z0-9_]+$/;

/**
 * Shared, hardened baseline email schema primitive
 */
export const baseEmailField = z
  .string({ message: "Email is required." })
  .trim()
  .email({ message: "Please provide a valid email address." })
  .max(255, { message: "Email is too long." })
  .refine((val) => !isDisposableEmail(val), {
    message: "Please use a standard email account to register.",
  })
  .transform((v) => v.toLowerCase());

/**
 * Layer 1 Structural matching schema configuration for Passwords
 */
export const basePasswordStructuralSchema = z
  .string({ message: "Password is required." })
  .trim()
  .min(8, { message: "Password must be at least 8 characters long." })
  .max(100, { message: "Password must not exceed 100 characters." })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    },
  );

/**
 * Shared utility to apply zxcvbn context-aware issues down Zod's refinement chain
 */
export const applyPasswordStrengthCheck = (password, userInputs, ctx) => {
  const result = checkPasswordStrength(password, userInputs);

  if (result.score < MIN_PASSWORD_SCORE) {
    const warning = result.feedback.warning
      ? `${result.feedback.warning}.`
      : "This password is too easy to guess.";

    const suggestions =
      result.feedback.suggestions.length > 0
        ? ` ${result.feedback.suggestions.join(" ")}`
        : " Try adding more uncommon words or characters.";

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: `${warning}${suggestions}`,
    });
  }
};
