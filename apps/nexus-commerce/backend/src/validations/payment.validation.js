import { z } from "zod";
import { isPhoneValid } from "#utils/phoneUtils.js";

// 1. Retry Payment for Unpaid Orders Schema
export const RetryPaymentSchema = z.object({
  body: z
    .object({
      orderId: z.string().min(1, "Order ID is required."),
      paymentMethod: z.enum(["stripe", "jazzcash", "easypaisa", "cod"]),
      mobileNumber: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        (data.paymentMethod === "jazzcash" ||
          data.paymentMethod === "easypaisa") &&
        data.mobileNumber
      ) {
        if (!isPhoneValid(data.mobileNumber, "PK")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["mobileNumber"],
            message:
              "Please enter a valid Pakistani mobile wallet phone number (03XXXXXXXXX).",
          });
        }
      }
    }),
});

// 2. Admin Refund Processing Schema
export const RefundPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required."),
    transactionId: z.string().min(1, "Transaction ID is required."),
    amount: z.coerce
      .number()
      .positive("Refund amount must be greater than zero."),
    reason: z
      .string()
      .min(3, "Please provide a valid refund reason (minimum 3 characters)."),
  }),
});

// 3. Apply Promotional Coupon Code Schema
export const ApplyCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2, "Coupon code must be at least 2 characters.")
      .max(20)
      .toUpperCase()
      .trim(),
  }),
});
