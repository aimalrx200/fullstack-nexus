// src/components/auth/VerifyEmail.jsx

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate, Link } from "react-router";
import { authApi } from "../../lib/api/authApi";
import { authManager } from "../../lib/auth/AuthManager";

// Standard UI step delays
const UI_STAGE_PAUSE_MS = 1800;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = searchParams.get("token");

  // State & Ref Guards
  const [step, setStep] = useState("verifying");
  const verificationFiredRef = useRef(false);
  const isMountedRef = useRef(true);

  // Unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { mutate: runVerification } = useMutation({
    mutationFn: async (verificationToken) => {
      const startTime = Date.now();

      // 1. Fire API call
      const response = await authApi.verifyEmail(verificationToken);

      // Minimum display duration for 'verifying' stage
      const elapsed = Date.now() - startTime;
      if (elapsed < UI_STAGE_PAUSE_MS) {
        await sleep(UI_STAGE_PAUSE_MS - elapsed);
      }

      return response;
    },
    onSuccess: async (verificationData) => {
      if (!isMountedRef.current) return;

      // 2. Stage: Verified
      setStep("verified");
      await sleep(UI_STAGE_PAUSE_MS);

      if (!isMountedRef.current) return;

      // 3. Stage: Syncing
      setStep("syncing");
      await sleep(UI_STAGE_PAUSE_MS);

      if (!isMountedRef.current) return;

      // 4. Update session data & notify auth subscribers
      if (verificationData?.user) {
        queryClient.setQueryData(["authUser"], verificationData.user);
        authManager.notifyLoginSuccess(verificationData.user);
      } else {
        await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }

      // 5. Navigate
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.error("Email verification failed:", error);
      if (isMountedRef.current) {
        setStep("error");
      }
    },
  });

  // Trigger mutation exactly ONCE per token
  useEffect(() => {
    if (token && !verificationFiredRef.current) {
      verificationFiredRef.current = true;
      runVerification(token);
    }
  }, [token, runVerification]);

  const getBadgeDotClass = () => {
    let stateClass = "verify-email-badge-dot-active";

    if (step === "error" || !token) {
      stateClass = "verify-email-badge-dot-danger";
    } else if (step === "verified" || step === "syncing") {
      stateClass = "verify-email-badge-dot-success";
    }

    return `auth-badge-dot ${stateClass}`;
  };

  return (
    <div className="auth-container">
      {/* Translucent Cyber Terminal Card */}
      <div className="auth-card">
        {/* Top Terminal Header Bar */}
        <div className="auth-header">
          <div className="auth-header-status">
            <span className={getBadgeDotClass()} />
            <span className="auth-header-title">SYS // EMAIL_VERIFICATION</span>
          </div>
          <span className="auth-version">v2.0.26</span>
        </div>

        {/* Invalid or Missing Token */}
        {!token && (
          <div className="verify-email-error-wrapper">
            <h2 className="verify-email-error-title">
              [!] Verification Problem
            </h2>
            <p className="verify-email-error-description">
              This link appears to be broken or incomplete.
            </p>
            <Link to="/login" className="verify-email-action-button">
              Back to Login
            </Link>
          </div>
        )}

        {/* Stage 1: Verifying */}
        {token && step === "verifying" && (
          <div className="verify-email-stage-wrapper">
            <div className="verify-email-stage-primary">
              <span>⏳</span>
              <span>VERIFYING LINK...</span>
            </div>
            <p className="verify-email-stage-text">
              Checking your setup details...
            </p>
          </div>
        )}

        {/* Stage 2: Verified */}
        {token && step === "verified" && (
          <div className="verify-email-stage-wrapper">
            <div className="verify-email-stage-success">
              <span>✅</span>
              <span>EMAIL VERIFIED</span>
            </div>
            <p className="verify-email-stage-text">
              Your account has been successfully confirmed.
            </p>
          </div>
        )}

        {/* Stage 3: Syncing */}
        {token && step === "syncing" && (
          <div className="verify-email-stage-wrapper">
            <div className="verify-email-stage-primary">
              <span>🚀</span>
              <span>ALMOST THERE...</span>
            </div>
            <p className="verify-email-stage-text">
              Setting up your workspace session...
            </p>
          </div>
        )}

        {/* Error State */}
        {token && step === "error" && (
          <div className="verify-email-error-wrapper">
            <h2 className="verify-email-error-title">
              [!] Verification Problem
            </h2>
            <p className="verify-email-error-description">
              We couldn't confirm this link. It may have expired or already been
              used.
            </p>
            <Link to="/login" className="verify-email-action-button">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
