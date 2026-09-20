// apps/nexus-commerce/backend/src/validations/support.validation.js
import { z } from "zod";
import { isPhoneValid, normalizePhoneNumber } from "#utils/phoneUtils.js";

// 1. Live Chat Message Payload Schema
export const SendMessageSchema = z.object({
  body: z.object({
    // Optional/nullable to support first-message on-demand conversation creation
    conversationId: z.string().nullable().optional(),
    text: z
      .string()
      .min(1, "Message text cannot be empty.")
      .max(2000, "Message cannot exceed 2000 characters.")
      .trim(),
    customerName: z.string().max(60).optional(),
    customerEmail: z
      .string()
      .email("Please provide a valid email address.")
      .optional()
      .nullable()
      .or(z.literal("")),
    attachments: z
      .array(
        z.object({
          // Accepts both HTTP(S) URLs and Base64 Data URIs from file drops
          url: z.string().min(1, "Attachment data is required."),
          fileName: z.string().optional(),
          fileType: z.string().optional(),
          fileSize: z.number().optional(),
        }),
      )
      .optional(),
  }),
});

// 2. Create Offline Support Ticket Schema
export const CreateTicketSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Customer name is required.").max(60),
    email: z
      .string()
      .email("Please provide a valid email address.")
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || isPhoneValid(val), {
        message: "Invalid phone number format.",
      })
      .transform((val) => (val ? normalizePhoneNumber(val) : undefined)),
    subject: z
      .string()
      .min(5, "Subject must be at least 5 characters long.")
      .max(120),
    category: z.enum([
      "payment_issue",
      "shipping",
      "product_inquiry",
      "return",
      "other",
    ]),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    message: z
      .string()
      .min(10, "Message must be at least 10 characters long.")
      .max(3000),
  }),
});

// 3. Admin Update Ticket Status Schema
export const UpdateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    adminNotes: z.string().max(2000).optional(),
  }),
  params: z.object({
    ticketId: z.string().min(1, "Ticket ID is required."),
  }),
});
