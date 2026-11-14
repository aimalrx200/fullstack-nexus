import { z } from "zod";

export const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
};

export const demoLoginSchema = {
  body: z
    .object({
      role: z.string().optional(),
    })
    .optional(),
};
