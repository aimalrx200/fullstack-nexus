// apps/nexus-commerce/frontend/src/pages/auth/VerifyEmailPage.jsx

import { useEffect, useRef } from "react";
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

  const { isLoading, isError, error, isSuccess } = useQuery({
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

  // Clean, consumer-friendly messaging without exposing backend terminology
  const errorMessage = !token
    ? "This verification link appears to be incomplete."
    : error?.response?.data?.message?.toLowerCase().includes("token")
      ? "This verification link has expired or has already been used."
      : error?.response?.data?.message ||
        "We were unable to verify your email. The link may have expired.";

  return (
    <div className="text-center py-8 space-y-4">
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-sm text-text-muted">
            Verifying your email address...
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
              Email Confirmed!
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Your email is confirmed. You will now receive live order tracking
              updates, delivery notifications, and receipts directly in your
              inbox.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate("/")}>
            Start Shopping
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
              Unable to Verify Email
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
