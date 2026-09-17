import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { authApi } from "../../lib/api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { Button } from "../common/Button";
import { toast } from "sonner";

const ResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must include uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({ token, onSuccess }) {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetSchema),
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const data = await authApi.resetPassword({
        token,
        password: formData.password,
      });
      dispatch(setCredentials(data.user));
      setIsComplete(true);
      toast.success(data.message || "Password updated successfully");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Password reset token expired",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-text-main">
          Password Reset Complete
        </h4>
        <p className="text-xs text-text-muted">
          All previous active sessions have been securely revoked. You are now
          logged in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-muted">
          New Secure Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            className="w-full min-h-11 px-3.5 pl-10 pr-10 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <Lock className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-rose-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-muted">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className="w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <Lock className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {errors.confirmPassword && (
          <p className="text-[11px] text-rose-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        Set New Password & Sign In
      </Button>
    </form>
  );
}
