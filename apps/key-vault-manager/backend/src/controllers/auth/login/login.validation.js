// server/controllers/login/login.validation.js

import { z } from "zod";
import {
  baseEmailField,
  usernameRegex,
} from "#validations/shared.validation.js";

// Validate against standard username constraints or a valid email layout
const identifierSchema = z.union(
  [
    baseEmailField,
    z
      .string()
      .trim()
      .min(1, { message: "Username or email is required." })
      .max(30)
      .regex(usernameRegex, { message: "Invalid username format." }),
  ],
  {
    errorMap: () => ({
      message: "Please provide a valid username or email address.",
    }),
  },
);

export const LoginSchema = z.object({
  body: z
    .object({
      identifier: identifierSchema,
      password: z
        .string({ message: "Password is required." })
        .min(1, { message: "Password is required." }),
    })
    .strict(),
});
