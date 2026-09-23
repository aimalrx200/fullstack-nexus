// apps/nexus-commerce/frontend/src/components/auth/LoginForm.jsx

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fingerprint, KeyRound, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import { authApi } from "../../lib/api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import {
  startAuthTransition,
  markAuthHandoff,
} from "../../redux/slices/uiSlice";
import { queryKeys } from "../../lib/api/queryKeys";
import { usePasskey } from "../../hooks/usePasskey";
import { Button } from "../common/Button";
import { DemoEvaluatorBar } from "./DemoEvaluatorBar";
import { GoogleLoginBtn } from "./GoogleLoginBtn";
import { navigateByRole } from "../../lib/auth/rbacNav";
import { toast } from "sonner";

const LoginSchema = z.object({
  email: z
    .string()
    .email("Valid email address is required")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgot,
  isModal = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const {
    authenticatePasskey,
    isPasskeyLoading,
    isSupported: isPasskeySupported,
  } = usePasskey();

  const [authMode, setAuthMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleAuthCompleted = (user) => {
    const returnTarget = location.state?.from;
    navigateByRole(navigate, user, { isModal, from: returnTarget });
    onSuccess?.(user);
  };

  // 1. Password login handler with continuous task bridge
  const onPasswordSubmit = async (formData) => {
    setIsSubmitting(true);
    dispatch(startAuthTransition());

    try {
      const data = await authApi.login(formData);
      dispatch(setCredentials(data.user));
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success(data.message || "Signed in successfully");
      dispatch(markAuthHandoff());
      handleAuthCompleted(data.user);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Biometric Passkey login handler with continuous task bridge
  const handlePasskeyLogin = async () => {
    const email = getValues("email");
    dispatch(startAuthTransition());

    const result = await authenticatePasskey(email);
    if (result.success && result.data?.user) {
      dispatch(markAuthHandoff());
      handleAuthCompleted(result.data.user);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1-Click Sandbox Persona Pass */}
      <DemoEvaluatorBar onAuthenticated={handleAuthCompleted} />

      {/* Auth Mode Toggle Pill */}
      {isPasskeySupported && (
        <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-elevated border border-border-main text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode("password")}
            className={`min-h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === "password"
                ? "bg-surface-card text-text-main shadow-xs border border-border-subtle"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("passkey")}
            className={`min-h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === "passkey"
                ? "bg-surface-card text-brand-primary shadow-xs border border-border-subtle font-bold"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Passkey Biometric</span>
          </button>
        </div>
      )}

      {/* Mode A: Password Login Form */}
      {authMode === "password" ? (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-muted">
              Email Address
            </label>
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
              <p className="text-[11px] text-rose-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-text-muted">
                Password
              </label>
              <button
                type="button"
                onClick={onSwitchToForgot}
                className="text-[11px] text-brand-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full font-bold shadow-md shadow-brand-primary/20"
          >
            Sign In with Password
          </Button>
        </form>
      ) : (
        /* Mode B: Passkey Biometric Login */
        <div className="space-y-4 text-center py-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-muted text-left">
              Account Email
            </label>
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
              <p className="text-[11px] text-rose-500 text-left">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            variant="luxury"
            size="lg"
            icon={Fingerprint}
            isLoading={isPasskeyLoading}
            onClick={handlePasskeyLogin}
            className="w-full font-bold shadow-lg shadow-indigo-500/25"
          >
            Sign In with Face ID / Touch ID
          </Button>
          <p className="text-[11px] text-text-muted">
            Instant cryptographic biometric sign-in on this device.
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <span className="relative px-3 bg-surface-card text-[11px] text-text-muted font-mono uppercase">
          Or continue with
        </span>
      </div>

      {/* Google OAuth Provider Button */}
      <GoogleLoginBtn onAuthenticated={handleAuthCompleted} isModal={isModal} />

      {/* Bottom Switch to Register */}
      <div className="text-center pt-1">
        <p className="text-xs text-text-muted">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-brand-primary font-semibold hover:underline cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
