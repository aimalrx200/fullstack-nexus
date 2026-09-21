// apps/nexus-commerce/frontend/src/components/auth/GoogleLoginBtn.jsx

import React, { useState, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "../../lib/api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { queryKeys } from "../../lib/api/queryKeys";
import { toast } from "sonner";

export function GoogleLoginBtn({ onAuthenticated, className = "" }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const isProcessingAuth = useRef(false);

  const resetState = useCallback(() => {
    setIsLoading(false);
    isProcessingAuth.current = false;
  }, []);

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.info("Google OAuth Client ID is not configured in .env");
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      toast.error("Google Identity Services failed to load. Please refresh.");
      return;
    }

    if (isProcessingAuth.current) return;
    isProcessingAuth.current = true;
    setIsLoading(true);

    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response) => {
          if (response.code) {
            try {
              const data = await authApi.googleLogin(response.code);
              dispatch(setCredentials(data.user));
              queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
              toast.success("Welcome! Signed in with Google Workspace.");

              onAuthenticated?.();

              // Smart Post-Login Routing based on Role
              const role = data.user?.role;
              if (role === "super_admin" || role === "merchant_admin") {
                navigate("/admin");
              } else if (role === "support_agent") {
                navigate("/admin/support");
              } else {
                navigate("/");
              }
            } catch (err) {
              console.error("Google OAuth token exchange failed:", err);
              toast.error(
                err?.response?.data?.message ||
                  "Google verification failed on server.",
              );
            } finally {
              resetState();
            }
          } else {
            resetState();
          }
        },
        error_callback: (err) => {
          if (err?.type === "popup_closed") {
            toast.info("Google sign-in window was closed.");
          } else if (err?.type === "popup_blocked") {
            toast.warning("Google sign-in popup was blocked by your browser.");
          } else {
            toast.error("Google sign-in encountered an issue.");
          }
          resetState();
        },
      });

      client.requestCode();
    } catch (err) {
      console.error("Google client initialization error:", err);
      toast.error("Failed to open Google sign-in window.");
      resetState();
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`w-full min-h-11 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-main border border-border-main text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Blue segment */}
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          {/* Green segment */}
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          {/* Yellow segment */}
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          {/* Red segment (Fixed Bezier curve path) */}
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isLoading ? "Authenticating..." : "Continue with Google"}</span>
    </button>
  );
}
