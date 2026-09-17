import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";

const CouponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20)
    .toUpperCase()
    .trim(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]).default("percentage"),
  discountPercent: z.coerce.number().min(1).max(100).optional(),
  discountAmountUSD: z.coerce.number().min(0).optional(),
  minOrderAmountUSD: z.coerce.number().min(0).default(0),
  maxUsageTotal: z.coerce.number().int().positive().nullable().optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export function CouponFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isLoading,
}) {
  const isEditing = Boolean(initialData?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CouponSchema),
    defaultValues: initialData || {
      code: "",
      discountType: "percentage",
      discountPercent: 10,
      minOrderAmountUSD: 0,
      perUserLimit: 1,
      isActive: true,
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Promotional Coupon" : "Create New Coupon"}
      description="Define redemption rules, percentage discounts, and order thresholds."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSave)} className="space-y-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">
            Coupon Code <span className="text-brand-primary">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. FLASH25"
            {...register("code")}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main font-mono uppercase text-xs focus:outline-hidden focus:border-brand-primary"
          />
          {errors.code && (
            <p className="text-[11px] text-rose-500">{errors.code.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Discount Type
            </label>
            <select
              {...register("discountType")}
              className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount ($)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Discount Value <span className="text-brand-primary">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              placeholder="10"
              {...register("discountPercent")}
              className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Min Order (USD)
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("minOrderAmountUSD")}
              className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Per User Limit
            </label>
            <input
              type="number"
              min={1}
              placeholder="1"
              {...register("perUserLimit")}
              className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
          >
            {isEditing ? "Save Changes" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
