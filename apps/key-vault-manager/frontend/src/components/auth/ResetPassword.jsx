// src/components/ResetPassword.jsx

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { authApi } from "../../lib/api/authApi";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Handles automated navigation transition cleanly upon verification matching
  useEffect(() => {
    if (!isCompleted) return;

    const redirectionTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 4000);

    return () => clearTimeout(redirectionTimer);
  }, [isCompleted, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => authApi.resetPassword(payload),
    onMutate: () => {
      setPasswordErrors([]);
    },
    onSuccess: () => {
      setIsCompleted(true);
    },
    onError: (err) => {
      const serverError = err.response?.data;

      if (serverError?.errors?.password) {
        setPasswordErrors(serverError.errors.password);
      } else {
        dispatch(
          triggerToast({
            message: "Reset Failed",
            description:
              serverError?.message ||
              "This link may have expired or already been used.",
            type: "error",
          }),
        );
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      dispatch(
        triggerToast({
          message: "Link Error",
          description: "This link is missing some required setup details.",
          type: "error",
        }),
      );
      return;
    }

    mutate({ token, password });
  };

  const getInputClass = () =>
    `auth-input ${passwordErrors.length > 0 ? "auth-input-error" : ""}`;

  return (
    <div className="auth-container">
      {/* Translucent Cyber Terminal Card */}
      <div className="auth-card">
        {/* Top Terminal Line Header */}
        <div className="auth-header">
          <div className="auth-header-status">
            <span className="auth-badge-dot" />
            <span className="auth-header-title">
              SYS // CREDENTIAL_OVERRIDE
            </span>
          </div>
          <span className="auth-version">v2.0.26</span>
        </div>

        <h2 className="auth-title">Choose a New Password</h2>
        <p className="auth-description">
          Please enter a secure password that meets our basic length
          requirements.
        </p>

        {isCompleted ? (
          <div className="auth-success-alert">
            <p className="auth-success-alert-title">
              Password updated successfully
            </p>
            <p className="auth-success-alert-text">
              Logging you out of other sessions for security. Moving to login
              now...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="auth-field-group">
              <label htmlFor="password" className="auth-label">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending || !token}
                className={getInputClass()}
                placeholder="••••••••"
                required
              />
              {passwordErrors.map((msg, index) => (
                <p key={index} className="auth-error-text">
                  ! {msg}
                </p>
              ))}
            </div>

            <button
              type="submit"
              disabled={isPending || !token}
              className="auth-submit-button"
            >
              {isPending ? "Saving Changes..." : "Update Password"}
            </button>

            <div className="auth-footer">
              <Link to="/login" className="auth-link-mono">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
