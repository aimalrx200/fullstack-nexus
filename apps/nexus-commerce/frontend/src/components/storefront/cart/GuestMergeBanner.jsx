import React from "react";
import { UserCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export function GuestMergeBanner({ onSignIn }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Sign in to save items across devices & checkout faster.</span>
      </div>
      <button
        type="button"
        onClick={onSignIn}
        className="font-semibold text-blue-200 hover:underline shrink-0 cursor-pointer text-xs"
      >
        Sign In
      </button>
    </div>
  );
}
