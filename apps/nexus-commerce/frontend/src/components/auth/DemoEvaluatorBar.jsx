import React from "react";
import { ShieldCheck, UserCheck, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function DemoEvaluatorBar({ onAuthenticated, className = "" }) {
  const { demoLogin, isDemoLoggingIn } = useAuth();

  const handleDemo = async (role) => {
    await demoLogin(role);
    onAuthenticated?.();
  };

  return (
    <div
      className={`p-3.5 rounded-2xl bg-linear-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-inner ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
          <span>1-Click Evaluator Sandbox</span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          Instant Zero-Password Pass
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Customer Demo Button */}
        <button
          type="button"
          disabled={isDemoLoggingIn}
          onClick={() => handleDemo("customer")}
          className="min-h-11 px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-main border border-border-main text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-xs"
        >
          {isDemoLoggingIn ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span>VIP Shopper</span>
        </button>

        {/* Merchant Admin Demo Button */}
        <button
          type="button"
          disabled={isDemoLoggingIn}
          onClick={() => handleDemo("admin")}
          className="min-h-11 px-3 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-main border border-border-main text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-xs"
        >
          {isDemoLoggingIn ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>Merchant Admin</span>
        </button>
      </div>
    </div>
  );
}
