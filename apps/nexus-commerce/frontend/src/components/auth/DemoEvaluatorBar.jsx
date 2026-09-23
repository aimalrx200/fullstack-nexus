// apps/nexus-commerce/frontend/src/components/auth/DemoEvaluatorBar.jsx

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  Loader2,
  Headphones,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import {
  startAuthTransition,
  markAuthHandoff,
} from "../../redux/slices/uiSlice";

export function DemoEvaluatorBar({ onAuthenticated, className = "" }) {
  const dispatch = useDispatch();
  const { demoLogin, isDemoLoggingIn } = useAuth();
  const [activeRole, setActiveRole] = useState(null);

  const handleDemo = async (role) => {
    setActiveRole(role);
    // 1. Start continuous task bridge (35%)
    dispatch(startAuthTransition());

    try {
      const user = await demoLogin(role);
      // 2. Advance to 65% and hold across route navigation
      dispatch(markAuthHandoff());
      onAuthenticated?.(user);
    } catch {
      // Errors handled via toast in useAuth
    } finally {
      setActiveRole(null);
    }
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
        <span className="text-[10px] font-mono text-text-muted font-medium">
          4-Tier RBAC Gated
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* VIP Shopper -> Customer */}
        <button
          type="button"
          disabled={isDemoLoggingIn}
          onClick={() => handleDemo("customer")}
          className="min-h-11 px-2 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-main border border-border-main text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] shadow-xs"
          title="Sign in as VIP Customer (Storefront Access)"
        >
          {activeRole === "customer" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="text-[11px] font-semibold">VIP Shopper</span>
        </button>

        {/* Support Specialist -> Support Agent */}
        <button
          type="button"
          disabled={isDemoLoggingIn}
          onClick={() => handleDemo("agent")}
          className="min-h-11 px-2 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-main border border-border-main text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] shadow-xs"
          title="Sign in as Support Specialist (Support Control Desk Access)"
        >
          {activeRole === "agent" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="text-[11px] font-semibold">Support Care</span>
        </button>

        {/* Operations Lead -> Merchant Admin */}
        <button
          type="button"
          disabled={isDemoLoggingIn}
          onClick={() => handleDemo("admin")}
          className="min-h-11 px-2 py-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-main border border-border-main text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] shadow-xs"
          title="Sign in as Operations Lead (Merchant Hub & Analytics Access)"
        >
          {activeRole === "admin" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span className="text-[11px] font-semibold">Merchant Ops</span>
        </button>
      </div>
    </div>
  );
}
