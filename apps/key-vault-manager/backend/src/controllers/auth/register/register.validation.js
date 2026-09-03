// server/controllers/register/register.validation.js

import { z } from "zod";
import {
  baseEmailField,
  basePasswordStructuralSchema,
  applyPasswordStrengthCheck,
  usernameRegex,
} from "#validations/shared.validation.js";

const registrationUsernameField = z
  .string({ message: "Username is required." })
  .trim()
  .min(3, { message: "Username must be at least 3 characters long." })
  .max(30, { message: "Username must be at most 30 characters long." })
  .regex(usernameRegex, {
    message: "Username can only contain letters, numbers, and underscores.",
  });

// 🟢 TEMPLATE UPGRADE: Validates clean single string representation for profile names
const registrationNameField = z
  .string()
  .trim()
  .max(60, { message: "Name must not exceed 60 characters." })
  .optional();

export const RegisterSchema = z.object({
  body: z
    .object({
      name: registrationNameField, // 🟢 Added to payload structural requirements
      username: registrationUsernameField,
      email: baseEmailField,
      password: basePasswordStructuralSchema,
    })
    .strict()
    .superRefine((data, ctx) => {
      const { password, username, email, name } = data;
      const emailParts = email ? email.split(/[@.]/).filter(Boolean) : [];
      const nameParts = name ? name.split(/\s+/).filter(Boolean) : []; // 🟢 Break full name down into substrings

      // Pass name variations to zxcvbn to block names inside passwords
      const userInputs = [username, ...emailParts, ...nameParts].filter(
        Boolean,
      );

      // Reuses shared zxcvbn evaluation helper
      applyPasswordStrengthCheck(password, userInputs, ctx);
    }),
});
