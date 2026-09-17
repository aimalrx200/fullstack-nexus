import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, Phone, HelpCircle, CheckCircle2 } from "lucide-react";
import { supportApi } from "../../../lib/api/supportApi";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { toast } from "sonner";

const TicketSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Valid email address is required")
    .toLowerCase()
    .trim(),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.enum([
    "payment_issue",
    "shipping",
    "product_inquiry",
    "return",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export function OfflineTicketForm({ isOpen, onClose }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      category: "product_inquiry",
      priority: "medium",
    },
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const data = await supportApi.createTicket(formData);
      setTicketNumber(data.ticket?.ticketNumber || "TKT-1001");
      setIsSubmitted(true);
      reset();
      toast.success("Support ticket registered successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create Support Ticket"
      description="Our support team will review your inquiry and respond via email."
      maxWidth="max-w-lg"
    >
      {isSubmitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-text-main font-mono">
              Ticket #{ticketNumber} Created
            </h4>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              We dispatched a confirmation to your email. An agent will review
              and follow up shortly.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={handleModalClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Your Name <span className="text-brand-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Aimal Khan"
                  {...register("name")}
                  className="w-full min-h-11 px-3 pl-9 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
                />
                <User className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && (
                <p className="text-[11px] text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Email Address <span className="text-brand-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@domain.com"
                  {...register("email")}
                  className="w-full min-h-11 px-3 pl-9 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
                />
                <Mail className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Subject <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Order delivery status inquiry"
              {...register("subject")}
              className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
            />
            {errors.subject && (
              <p className="text-[11px] text-rose-500">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
              >
                <option value="product_inquiry">Product Inquiry</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="shipping">Shipping & Delivery</option>
                <option value="return">Return & Refund</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Detailed Message */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Message Details <span className="text-brand-primary">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Please describe your issue or question in detail..."
              {...register("message")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs resize-none focus:outline-hidden focus:border-brand-primary custom-scrollbar"
            />
            {errors.message && (
              <p className="text-[11px] text-rose-500">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
