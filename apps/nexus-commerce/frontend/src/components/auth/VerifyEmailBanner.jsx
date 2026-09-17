import React, { useState } from "react";
import { AlertCircle, Mail, Loader2, Check } from "lucide-react";
import { authApi } from "../../lib/api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

export function VerifyEmailBanner() {
  const { user, isAuthenticated, isEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [hasResent, setHasResent] = useState(false);

  if (!isAuthenticated || isEmailVerified || !user?.email) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerification(user.email);
      setHasResent(true);
      toast.success("Verification link dispatched to your email");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to dispatch email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <aside
      aria-label="Email verification notice"
      className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2 z-30 transition-colors"
    >
      <div className="flex items-center gap-2 text-center sm:text-left">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Please verify your email (<strong>{user.email}</strong>) to receive
          order tracking alerts and live invoices.
        </span>
      </div>

      <button
        onClick={handleResend}
        disabled={isResending || hasResent}
        className="min-h-8 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isResending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : hasResent ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
        <span>
          {hasResent ? "Email Dispatched" : "Resend Verification Email"}
        </span>
      </button>
    </aside>
  );
}
