// src/components/GoogleLoginButton.jsx

import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { authApi } from "../../lib/api/authApi";
import { authManager } from "../../lib/auth/AuthManager";

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isProcessingAuth = useRef(false);

  const resetState = useCallback(() => {
    setIsPopupOpen(false);
    isProcessingAuth.current = false;
  }, []);

  // 1. Token exchange mutation
  const { mutate: exchangeToken, isPending: isMutating } = useMutation({
    mutationFn: (authCode) => authApi.googleAuth(authCode),
    onSuccess: (data) => {
      dispatch(
        triggerToast({
          message: "Welcome Back",
          description: "Successfully authenticated via Google Workspace.",
          type: "success",
        }),
      );

      const userPayload = data?.user || data;

      // 🟢 Clears previous user's query cache and broadcasts login cleanly
      authManager.notifyLoginSuccess(userPayload);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.error("Backend OAuth Exchange Failed:", error);
      dispatch(
        triggerToast({
          message: "Authentication Failed",
          description:
            error.response?.data?.message ||
            "Google verification failed. Please try again.",
          type: "error",
        }),
      );
    },
    onSettled: () => {
      resetState();
    },
  });

  // 2. Stable Callbacks
  const handleSuccess = useCallback(
    (authResult) => {
      if (authResult?.code) {
        isProcessingAuth.current = true;
        exchangeToken(authResult.code);
      } else {
        resetState();
      }
    },
    [exchangeToken, resetState],
  );

  const handleError = useCallback(
    (err) => {
      console.error("Google OAuth Error:", err);
      dispatch(
        triggerToast({
          message: "Authentication Failed",
          description: "Google authentication failed. Please try again.",
          type: "error",
        }),
      );
      resetState();
    },
    [dispatch, resetState],
  );

  const handleNonOAuthError = useCallback(
    (err) => {
      if (err?.type === "popup_closed") {
        dispatch(
          triggerToast({
            message: "Sign-In Canceled",
            description: "The Google sign-in window was closed.",
            type: "info",
          }),
        );
      } else {
        dispatch(
          triggerToast({
            message: "Popup Interrupted",
            description:
              "Google sign-in window encountered an issue or was blocked.",
            type: "warning",
          }),
        );
      }
      resetState();
    },
    [dispatch, resetState],
  );

  // 3. Google Login Hook with popup mode
  const login = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "popup",
    onSuccess: handleSuccess,
    onError: handleError,
    onNonOAuthError: handleNonOAuthError,
  });

  const handleButtonClick = (e) => {
    e?.preventDefault?.();
    if (isProcessingAuth.current || isPopupOpen) return;
    setIsPopupOpen(true);
    login();
  };

  const isLoading = isPopupOpen || isMutating;

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      disabled={isLoading}
      className="google-login-button"
    >
      <span
        className={`google-login-icon ${
          isLoading ? "google-login-icon-loading" : ""
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-full h-full"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </span>
      <span className="google-login-text">
        {isLoading ? "Authenticating..." : "Continue with Google"}
      </span>
    </button>
  );
}
