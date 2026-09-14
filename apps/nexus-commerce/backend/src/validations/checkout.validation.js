import { z } from "zod";
import { isPhoneValid, normalizePhoneNumber } from "#utils/phoneUtils.js";

// 1. 10-Minute Flash-Sale Inventory Hold Schema
export const CheckoutHoldSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          variantId: z.string().min(1, "Variant ID is required."),
          quantity: z
            .number()
            .int()
            .positive("Quantity must be a positive integer."),
        }),
      )
      .min(1, "At least one item is required to lock inventory."),
    sessionId: z.string().min(1, "Session tracking ID is required."),
    cartId: z.string().min(1, "Cart ID is required."),
  }),
});

// 2. Shipping Quote Calculator Schema
export const ShippingQuoteSchema = z.object({
  body: z.object({
    destinationAddress: z.string().optional(),
    destinationCity: z.string().min(2, "Destination city is required."),
    destinationCoordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
  }),
});

// 3. Complete Checkout Order Creation with Conditional Gateway Refinement
export const CreateOrderSchema = z.object({
  body: z
    .object({
      cartId: z.string().min(1, "Cart ID is required."),
      customerEmail: z
        .string()
        .email("Valid customer email is required.")
        .toLowerCase()
        .trim(),
      customerPhone: z
        .string()
        .refine((val) => isPhoneValid(val), {
          message: "Please provide a valid contact phone number.",
        })
        .transform((val) => normalizePhoneNumber(val)),
      paymentMethod: z.enum(["stripe", "jazzcash", "easypaisa", "cod"]),
      shippingAddress: z.object({
        recipientName: z.string().min(2, "Recipient name is required."),
        phone: z
          .string()
          .refine((val) => isPhoneValid(val), {
            message: "Valid delivery phone is required.",
          })
          .transform((val) => normalizePhoneNumber(val)),
        street: z.string().min(3, "Street address is required."),
        city: z.string().min(2, "City is required."),
        state: z.string().min(2, "State or Province is required."),
        postalCode: z.string().min(2, "Postal code is required."),
        country: z.string().default("Pakistan"),
        countryCode: z.string().default("PK"),
        coordinates: z
          .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
          })
          .optional(),
      }),
      mobileNumber: z.string().optional(),
      idempotencyKey: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Conditional Gateway Gate: Enforce valid Pakistani mobile account for JazzCash / Easypaisa
      if (
        data.paymentMethod === "jazzcash" ||
        data.paymentMethod === "easypaisa"
      ) {
        const phoneToCheck = data.mobileNumber || data.customerPhone;
        const isValid = isPhoneValid(phoneToCheck, "PK");

        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["mobileNumber"],
            message: `A valid Pakistani mobile account (03XXXXXXXXX) is required for ${data.paymentMethod.toUpperCase()} payments.`,
          });
        }
      }
    }),
});
