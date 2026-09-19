// apps/nexus-commerce/frontend/src/components/admin/staff/InviteStaffModal.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { UserPlus } from "lucide-react";

const InviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z
    .string()
    .email("Valid email address is required.")
    .toLowerCase()
    .trim(),
  role: z.enum(["support_agent", "merchant_admin"]),
});

export function InviteStaffModal({ isOpen, onClose, onInvite, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(InviteSchema),
    defaultValues: { name: "", email: "", role: "support_agent" },
  });

  const onSubmit = (formData) => {
    onInvite(formData);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Provision access to the Merchant Hub or Customer Support Control Desk."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Full Name <span className="text-brand-primary">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Farhan Ali"
            {...register("name")}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Work Email Address <span className="text-brand-primary">*</span>
          </label>
          <input
            type="email"
            placeholder="staff@nexuscommerce.io"
            {...register("email")}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Role Permission Tier <span className="text-brand-primary">*</span>
          </label>
          <select
            {...register("role")}
            className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
          >
            <option value="support_agent">
              Support Agent (Support Desk + Directory)
            </option>
            <option value="merchant_admin">
              Merchant Admin (Full Operations + Analytics)
            </option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="luxury"
            size="md"
            icon={UserPlus}
            isLoading={isLoading}
          >
            Provision Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
