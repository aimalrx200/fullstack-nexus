// src/components/ForgotPassword.jsx

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { authApi } from "../../lib/api/authApi";

export function ForgotPassword() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (targetEmail) => authApi.forgotPassword(targetEmail),
    onMutate: () => {
      setFieldError("");
      setSuccessMessage("");
    },
    onSuccess: (data) => {
      setSuccessMessage(
        data?.message ||
          "If the account exists, a recovery link has been dispatched.",
      );
    },
    onError: (err) => {
      const serverError = err.response?.data;

      if (serverError?.errors?.email) {
        setFieldError(serverError.errors.email[0]);
      } else {
        dispatch(
          triggerToast({
            message: "Recovery Request Failed",
            description:
              serverError?.message ||
              "An unexpected error occurred. Please try again.",
            type: "error",
          }),
        );
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutate(email.trim());
  };

  const getInputClass = () =>
    `auth-input ${fieldError ? "auth-input-error" : ""}`;

  return (
    <div className="auth-container">
      {/* Translucent Cyber Terminal Card */}
      <div className="auth-card">
        {/* Top Terminal Line Header */}
        <div className="auth-header">
          <div className="auth-header-status">
            <span className="auth-badge-dot" />
            <span className="auth-header-title">SYS // RECOVERY_GATEWAY</span>
          </div>
          <span className="auth-version">v2.0.26</span>
        </div>

        <h2 className="auth-title">Recover Account</h2>
        <p className="auth-description">
          Enter your registered email below to receive a password reset link.
        </p>

        {successMessage ? (
          <div className="auth-success-alert">
            <p className="auth-success-alert-title">Request Dispatched</p>
            <p className="auth-success-alert-text">{successMessage}</p>
            <div className="auth-footer">
              <Link to="/login" className="auth-link-mono">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="auth-field-group">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className={getInputClass()}
                placeholder="you@example.com"
                required
              />
              {fieldError && <p className="auth-error-text">! {fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="auth-submit-button"
            >
              {isPending ? "Dispatching..." : "Send Reset Link"}
            </button>

            <div className="auth-footer">
              <Link to="/login" className="auth-link">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
