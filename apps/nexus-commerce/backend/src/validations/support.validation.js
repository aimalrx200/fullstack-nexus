// apps/nexus-commerce/backend/src/validations/support.validation.js
import { z } from "zod";
import { isPhoneValid, normalizePhoneNumber } from "#utils/phoneUtils.js";

// 1. Live Chat Message Payload Schema (Valid if text OR attachment is present)
export const SendMessageSchema = z.object({
  body: z
    .object({
      conversationId: z.string().nullable().optional(),
      text: z
        .string()
        .max(2000, "Message cannot exceed 2000 characters.")
        .optional()
        .default(""),
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
            url: z.string().min(1, "Attachment data is required."),
            fileName: z.string().optional(),
            fileType: z.string().optional(),
            fileSize: z.number().optional(),
          }),
        )
        .optional()
        .default([]),
    })
    .superRefine((data, ctx) => {
      const hasText = Boolean(data.text && data.text.trim().length > 0);
      const hasAttachments = Boolean(
        data.attachments && data.attachments.length > 0,
      );

      if (!hasText && !hasAttachments) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["text"],
          message: "Please enter a message or attach a file.",
        });
      }
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
