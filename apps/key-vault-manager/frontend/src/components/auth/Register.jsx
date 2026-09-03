// src/components/Register.jsx

import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { triggerToast } from "../../redux/slices/notificationSlice";
import { authApi } from "../../lib/api/authApi";

import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

const zxcvbn = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

const STRENGTH_LEVELS = [
  {
    label: "Too weak",
    color: "bg-status-danger",
    textColor: "text-status-danger",
  },
  {
    label: "Weak",
    color: "bg-status-danger",
    textColor: "text-status-danger",
  },
  {
    label: "Fair",
    color: "bg-status-warning",
    textColor: "text-status-warning",
  },
  {
    label: "Good",
    color: "bg-brand-primary",
    textColor: "text-brand-primary",
  },
  {
    label: "Strong",
    color: "bg-status-success",
    textColor: "text-status-success",
  },
];

function StrengthBar({ score, warning, suggestions }) {
  const level = STRENGTH_LEVELS[score];
  const filledSegments = score + 1;
  return (
    <div className="strength-bar-container">
      <div className="strength-bar-segments">
        {STRENGTH_LEVELS.map((s, i) => (
          <div
            key={i}
            className={`strength-bar-segment ${
              i < filledSegments ? s.color : "strength-bar-segment-empty"
            }`}
          />
        ))}
      </div>
      <div className="strength-bar-meta">
        <span className="strength-bar-label">Entropy Score:</span>
        <span className={`strength-bar-score ${level.textColor}`}>
          {level.label}
        </span>
      </div>
      {(warning || suggestions.length > 0) && (
        <ul className="strength-bar-feedback">
          {warning && (
            <li className="strength-bar-warning">
              <span>⚠</span> {warning}
            </li>
          )}
          {suggestions.map((s, i) => (
            <li key={i} className="strength-bar-suggestion">
              -&gt; {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldError({ errors }) {
  if (!errors) return null;
  const errorList = Array.isArray(errors) ? errors : [errors];
  if (errorList.length === 0) return null;

  return (
    <ul className="register-error-list">
      {errorList.map((error, i) => (
        <li key={i} className="register-error-item">
          ! {error}
        </li>
      ))}
    </ul>
  );
}

export function Register() {
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);

  const strength = useMemo(() => {
    if (!password) return null;
    const emailParts = email ? email.split(/[@.]/).filter(Boolean) : [];
    const nameParts = name ? name.split(/\s+/).filter(Boolean) : [];
    const userInputs = [username, ...emailParts, ...nameParts].filter(Boolean);
    return zxcvbn.check(password, userInputs);
  }, [password, username, email, name]);

  const { mutate, isPending } = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: () => {
      setFormErrors({});
      setIsRegistered(true);
    },
    onError: (err) => {
      const errData = err.response?.data;
      setFormErrors({});

      if (
        errData?.errors &&
        typeof errData.errors === "object" &&
        !Array.isArray(errData.errors)
      ) {
        setFormErrors(errData.errors);
      } else {
        dispatch(
          triggerToast({
            message: "Registration Failed",
            description:
              errData?.message ||
              "An unexpected network error occurred. Please try again.",
            type: "error",
          }),
        );
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      name: name.trim() || undefined,
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  const hasError = (field) => !!formErrors[field];

  const getInputClass = (field) =>
    `auth-input ${hasError(field) ? "auth-input-error" : ""}`;

  return (
    <div className="auth-container">
      {/* Translucent Cyber Terminal Card */}
      <div className="auth-card">
        {/* Top Terminal Line Header */}
        <div className="auth-header">
          <div className="auth-header-status">
            <span className="auth-badge-dot" />
            <span className="auth-header-title">
              SYS // NEW_USER_REGISTRATION
            </span>
          </div>
          <span className="auth-version">v2.0.26</span>
        </div>

        {isRegistered ? (
          <div className="register-success-container">
            <div className="register-success-icon-badge">
              <span className="register-success-checkmark">✓</span>
            </div>
            <h1 className="register-success-title">Verify Your Email</h1>
            <p className="register-success-message">
              We have dispatched a verification link to{" "}
              <strong className="register-success-email">{email}</strong>.
              Please click the link inside that message to activate your profile
              features.
            </p>
            <div className="register-success-action">
              <Link to="/login" className="register-success-link">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Create Your Account</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field-group">
                <div className="auth-field-header">
                  <label className="auth-label">Full Name</label>
                  <span className="register-optional-tag">Optional</span>
                </div>
                <input
                  className={getInputClass("name")}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
                <FieldError errors={formErrors.name} />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Username</label>
                <input
                  className={getInputClass("username")}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a handle"
                  required
                />
                <FieldError errors={formErrors.username} />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Email Address</label>
                <input
                  className={getInputClass("email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <FieldError errors={formErrors.email} />
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Password</label>
                <input
                  className={getInputClass("password")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {strength !== null && (
                  <StrengthBar
                    score={strength.score}
                    warning={strength.feedback.warning}
                    suggestions={strength.feedback.suggestions}
                  />
                )}
                <FieldError errors={formErrors.password} />
              </div>

              <button
                className="auth-submit-button"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
