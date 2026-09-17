import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authApi } from "../../lib/api/authApi";
import { Button } from "../common/Button";
import { toast } from "sonner";

const ForgotSchema = z.object({
  email: z.string().email("Please enter a valid email").toLowerCase().trim(),
});

export function ForgotPasswordForm({ onBackToLogin }) {
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotSchema),
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const data = await authApi.forgotPassword(formData.email);
      setIsSent(true);
      toast.success(data.message || "Reset link dispatched");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to dispatch reset link",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-text-main">
            Check your mailbox
          </h4>
          <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
            If an account matches that email, a 15-minute cryptographic reset
            link has been sent.
          </p>
        </div>
        <Button variant="outline" size="md" onClick={onBackToLogin}>
          Return to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1 text-center">
        <h3 className="text-sm font-semibold text-text-main">
          Reset Account Password
        </h3>
        <p className="text-xs text-text-muted">
          Enter your registered email to receive a secure password reset link.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <input
            type="email"
            placeholder="you@domain.com"
            {...register("email")}
            className="w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <Mail className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {errors.email && (
          <p className="text-[11px] text-rose-500">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        Send Reset Link
      </Button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-main pt-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to login</span>
      </button>
    </form>
  );
}
