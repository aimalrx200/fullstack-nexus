// apps/nexus-commerce/backend/src/validations/staff.validation.js
import { z } from "zod";

export const InviteStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long.").max(60),
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    role: z.enum(["support_agent", "merchant_admin"], {
      errorMap: () => ({
        message: "Role must be either 'support_agent' or 'merchant_admin'.",
      }),
    }),
  }),
});

export const UpdateStaffRoleSchema = z.object({
  body: z.object({
    role: z.enum(["support_agent", "merchant_admin", "super_admin"], {
      errorMap: () => ({ message: "Invalid role assignment target." }),
    }),
  }),
  params: z.object({
    userId: z.string().min(1, "User ID is required."),
  }),
});
