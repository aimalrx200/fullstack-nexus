import { z } from "zod";

export const CreateCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters.")
      .max(20, "Coupon code cannot exceed 20 characters.")
      .toUpperCase()
      .trim(),
    description: z.string().max(200).optional(),
    discountType: z.enum(["percentage", "fixed_amount"]).default("percentage"),
    discountPercent: z.coerce.number().min(1).max(100).optional(),
    discountAmountUSD: z.coerce.number().min(0).optional(),
    discountAmountPKR: z.coerce.number().min(0).optional(),
    minOrderAmountUSD: z.coerce.number().min(0).default(0),
    minOrderAmountPKR: z.coerce.number().min(0).default(0),
    maxDiscountUSD: z.coerce.number().positive().nullable().optional(),
    maxDiscountPKR: z.coerce.number().positive().nullable().optional(),
    maxUsageTotal: z.coerce.number().int().positive().nullable().optional(),
    perUserLimit: z.coerce.number().int().min(1).default(1),
    validFrom: z.string().datetime().optional().or(z.date().optional()),
    validUntil: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .or(z.date().nullable().optional()),
    isActive: z.boolean().default(true),
  }),
});

export const UpdateCouponSchema = z.object({
  body: z.object({
    description: z.string().max(200).optional(),
    discountType: z.enum(["percentage", "fixed_amount"]).optional(),
    discountPercent: z.coerce.number().min(1).max(100).optional(),
    discountAmountUSD: z.coerce.number().min(0).optional(),
    discountAmountPKR: z.coerce.number().min(0).optional(),
    minOrderAmountUSD: z.coerce.number().min(0).optional(),
    minOrderAmountPKR: z.coerce.number().min(0).optional(),
    maxDiscountUSD: z.coerce.number().positive().nullable().optional(),
    maxDiscountPKR: z.coerce.number().positive().nullable().optional(),
    maxUsageTotal: z.coerce.number().int().positive().nullable().optional(),
    perUserLimit: z.coerce.number().int().min(1).optional(),
    validFrom: z.string().datetime().optional().or(z.date().optional()),
    validUntil: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .or(z.date().nullable().optional()),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    couponId: z.string().min(1, "Coupon ID is required."),
  }),
});
