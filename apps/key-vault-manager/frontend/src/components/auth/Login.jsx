// src/components/Login.jsx

import { useState, startTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Zap } from "lucide-react";
import { triggerToast } from "../../redux/slices/notificationSlice.js";
import { authApi } from "../../lib/api/authApi.js";
import { authManager } from "../../lib/auth/AuthManager.js";
import GoogleLoginButton from "./GoogleLoginButton.jsx";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formErrors, setFormErrors] = useState({});

  const handleAuthSuccess = (data) => {
    setFormErrors({});

    dispatch(
      triggerToast({
        message: "Access Granted",
        description:
          data?.message || "Successfully authenticated into secure workspace.",
        type: "success",
      }),
    );

    startTransition(() => {
      const userPayload = data?.user || data;

      // Clears previous account query cache and broadcasts login cleanly
      authManager.notifyLoginSuccess(userPayload);
      navigate("/", { replace: true });
    });
  };

  // Standard Credential Login
  const { mutate: runLogin, isPending: isLoginPending } = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      const errData = error.response?.data;
      setFormErrors({});

      if (
        errData?.errors &&
        typeof errData.errors === "object" &&
        !Array.isArray(errData.errors)
      ) {
        const mapped = {};
        for (const key in errData.errors) {
          if (Object.hasOwn(errData.errors, key)) {
            const errorField =
              key === "username" || key === "email" ? "identifier" : key;
            mapped[errorField] = errData.errors[key][0];
          }
        }
        setFormErrors(mapped);
      } else {
        dispatch(
          triggerToast({
            message: "Login Failed",
            description:
              errData?.message || "An unexpected network error occurred.",
            type: "error",
          }),
        );
      }
    },
  });

  // 1-Click Evaluator Guest Pass
  const { mutate: runDemoLogin, isPending: isDemoPending } = useMutation({
    mutationFn: () => authApi.demoLogin(),
    onSuccess: handleAuthSuccess,
    onError: (error) => {
      dispatch(
        triggerToast({
          message: "Demo Access Failed",
          description:
            error.response?.data?.message ||
            "Could not initialize demo session. Please try standard login.",
          type: "error",
        }),
      );
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (payload.identifier) {
      payload.identifier = payload.identifier.trim();
    }

    runLogin(payload);
  };

  const isBusy = isLoginPending || isDemoPending;
  const hasError = (field) => !!formErrors[field];
  const getInputClass = (field) =>
    `auth-input ${hasError(field) ? "auth-input-error" : ""}`;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Top Terminal Line Header */}
        <div className="auth-header">
          <div className="auth-header-status">
            <span className="auth-badge-dot" />
            <span className="auth-header-title">SYS // AUTH_GATEWAY</span>
          </div>
          <span className="auth-version">v2.0.26</span>
        </div>

        <h1 className="auth-title">Sign in to your account</h1>

        {/* 1-Click Showcase Evaluator Access */}
        <button
          type="button"
          onClick={() => runDemoLogin()}
          disabled={isBusy}
          className="auth-demo-button"
        >
          <Zap className="h-4 w-4 text-brand-secondary animate-pulse" />
          <span>
            {isDemoPending
              ? "Initializing Evaluator Session..."
              : "⚡ Instant Evaluator Access (Demo Pass)"}
          </span>
        </button>

        <div className="w-full mt-2.5">
          <GoogleLoginButton />
        </div>

        <div className="auth-divider-container">
          <div className="auth-divider-line-wrapper">
            <div className="auth-divider-line" />
          </div>
          <div className="auth-divider-text-wrapper">
            <span className="auth-divider-text">
              Or continue with credentials
            </span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleFormSubmit}>
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="identifier">
              Email or Username
            </label>
            <input
              className={getInputClass("identifier")}
              type="text"
              name="identifier"
              id="identifier"
              placeholder="you@example.com or username"
              disabled={isBusy}
              required
            />
            {formErrors.identifier && (
              <p className="auth-error-text">! {formErrors.identifier}</p>
            )}
          </div>

          <div className="auth-field-group">
            <div className="auth-field-header">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="auth-link-mono">
                Forgot password?
              </Link>
            </div>
            <input
              className={getInputClass("password")}
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              disabled={isBusy}
              required
            />
            {formErrors.password && (
              <p className="auth-error-text">! {formErrors.password}</p>
            )}
          </div>

          <button
            className="auth-submit-button"
            type="submit"
            disabled={isBusy}
          >
            {isLoginPending ? "Authenticating…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
