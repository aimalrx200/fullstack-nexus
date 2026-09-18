import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authApi } from "../../lib/api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const { markVerified } = useAuth();
  const hasMarkedVerified = useRef(false);

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  // Guarded to execute markVerified only once
  useEffect(() => {
    if (isSuccess && !hasMarkedVerified.current) {
      hasMarkedVerified.current = true;
      markVerified();
    }
  }, [isSuccess, markVerified]);

  const errorMessage = !token
    ? "Verification token is missing from the URL link."
    : error?.response?.data?.message ||
      "Invalid or expired verification token.";

  return (
    <div className="text-center py-8 space-y-4">
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-xs text-text-muted font-mono">
            Verifying cryptographic token...
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="space-y-4 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              {data?.message || "Email Verified Successfully!"}
            </h3>
            <p className="text-xs text-text-muted">
              Your account is now verified. You can now receive real-time order
              invoices and courier alerts.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate("/")}>
            Go to Storefront
          </Button>
        </div>
      )}

      {(!token || isError) && (
        <div className="space-y-4 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              Verification Failed
            </h3>
            <p className="text-xs text-rose-400/90 leading-relaxed max-w-xs mx-auto">
              {errorMessage}
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate("/login")}
          >
            Back to Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
