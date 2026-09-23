// apps/nexus-commerce/frontend/src/components/auth/RegisterForm.jsx

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import { authApi } from "../../lib/api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { queryKeys } from "../../lib/api/queryKeys";
import { Button } from "../common/Button";
import { PasskeyPromptModal } from "./PasskeyPromptModal";
import { navigateByRole } from "../../lib/auth/rbacNav";
import { toast } from "sonner";

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long.")
    .max(60, "Name cannot exceed 60 characters."),
  email: z
    .string()
    .email("Valid email address is required.")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])/,
      "Password must include uppercase, lowercase, a number, and a special character.",
    ),
});

function PasswordEntropyMeter({ control }) {
  const password = useWatch({ control, name: "password", defaultValue: "" });

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#^()_+\-=]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1 pt-1 animate-in fade-in">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-colors ${
              step <= strengthScore
                ? strengthScore <= 2
                  ? "bg-amber-400"
                  : "bg-emerald-400"
                : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-text-muted font-mono flex items-center justify-between">
        <span>Entropy Security:</span>
        <span
          className={
            strengthScore >= 3 ? "text-emerald-400 font-bold" : "text-amber-400"
          }
        >
          {strengthScore === 4
            ? "Exceptional Entropy"
            : strengthScore === 3
              ? "Strong Password"
              : "Weak (add symbols & mix case)"}
        </span>
      </p>
    </div>
  );
}

export function RegisterForm({ onSuccess, onSwitchToLogin, isModal = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [isOpenPasskeyModal, setIsOpenPasskeyModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const data = await authApi.register(formData);
      dispatch(setCredentials(data.user));
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Account created successfully!");
      setRegisteredUser(data.user);
      setIsOpenPasskeyModal(true);
    } catch (err) {
      const serverResponse = err?.response?.data;
      const validationErrors = serverResponse?.errors;

      if (validationErrors && typeof validationErrors === "object") {
        let firstErrorMessage = null;
        Object.entries(validationErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (message) {
            if (!firstErrorMessage) firstErrorMessage = message;
            setError(field, { type: "server", message: String(message) });
          }
        });
        toast.error(
          firstErrorMessage || "Please correct the highlighted field errors.",
        );
      } else if (err?.response?.status === 409) {
        setError("email", {
          type: "server",
          message:
            serverResponse?.message ||
            "An account with this email already exists.",
        });
        toast.error(
          serverResponse?.message || "Email address is already in use.",
        );
      } else {
        toast.error(
          serverResponse?.message || "Registration failed. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyModalClosed = () => {
    setIsOpenPasskeyModal(false);
    if (registeredUser) {
      navigateByRole(navigate, registeredUser, {
        isModal,
        from: location.state?.from,
      });
    }
    onSuccess?.(registeredUser);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Aimal Khan"
              {...register("name")}
              className={`w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border text-text-main text-xs focus:outline-hidden transition-colors ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-border-main focus:border-brand-primary"
              }`}
            />
            <User className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.name && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="you@domain.com"
              {...register("email")}
              className={`w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border text-text-main text-xs focus:outline-hidden transition-colors ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-border-main focus:border-brand-primary"
              }`}
            />
            <Mail className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create strong password"
              {...register("password")}
              className={`w-full min-h-11 px-3.5 pl-10 pr-10 rounded-xl bg-surface-elevated border text-text-main text-xs focus:outline-hidden transition-colors ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-border-main focus:border-brand-primary"
              }`}
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

          <PasswordEntropyMeter control={control} />

          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="luxury"
          size="lg"
          icon={Sparkles}
          isLoading={isSubmitting}
          className="w-full font-bold shadow-lg shadow-indigo-500/25"
        >
          Create Free Account
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-text-muted">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-brand-primary font-semibold hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>

      {registeredUser && (
        <PasskeyPromptModal
          isOpen={isOpenPasskeyModal}
          onClose={handlePasskeyModalClosed}
          userEmail={registeredUser.email}
          userName={registeredUser.name}
        />
      )}
    </>
  );
}
