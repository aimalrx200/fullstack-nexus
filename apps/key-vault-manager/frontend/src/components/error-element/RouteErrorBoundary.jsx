// src/components/RouteErrorBoundary.jsx

import { useId, useMemo } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Terminal } from "lucide-react";
import { ROUTES } from "../../routes/routes";
import { NotFound } from "../not-found/NotFound";

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Generate a pure, stable ID per error boundary mount
  const instanceId = useId();
  const exceptionId = useMemo(() => {
    // Sanitizes useId string into a stable 7-char alphanumeric code
    const cleanId = instanceId.replace(/[^a-zA-Z0-9]/g, "");
    return (cleanId || "ERR001").substring(0, 7).toUpperCase();
  }, [instanceId]);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  let title = "An unexpected error occurred";
  let message = "Something went wrong while rendering this page.";

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return (
    <div className="route-error-container">
      {/* Cyber Grid & Scanline Background Layer */}
      <div className="route-error-grid-overlay" />
      <div className="route-error-scanline-overlay" />
      <div className="route-error-hud-frame" />

      {/* Static Ambient Danger Glow Backdrop */}
      <div className="route-error-ambient-glow" />

      <div className="route-error-wrapper">
        {/* Motion Wrapper: Purely handles entrance transform & fade */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="route-error-motion-container"
        >
          {/* Visual Container: Encapsulates backdrop-blur, clip-path notch, and card borders */}
          <div className="route-error-card">
            {/* Top Terminal Status Header Bar */}
            <div className="route-error-header">
              <div className="route-error-header-status">
                <span className="route-error-badge-dot" />
                <span className="route-error-header-title">
                  SYS // CRITICAL_EXCEPTION
                </span>
              </div>
              <div className="route-error-header-log">
                <Terminal className="route-error-header-log-icon" />
                <span>ERR_LOG</span>
              </div>
            </div>

            {/* Alert Triangle Icon Badge */}
            <div className="route-error-icon-badge">
              <AlertTriangle className="route-error-icon" />
            </div>

            {/* Status Badge */}
            <span className="route-error-status-tag">
              [!] APPLICATION ERROR
            </span>

            <h1 className="route-error-title">{title}</h1>

            <div className="route-error-message-box">
              <p className="route-error-message-text">
                <span className="route-error-message-prefix">&gt;</span>{" "}
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="route-error-actions">
              {/* Reload Application Action */}
              <button
                onClick={() => window.location.reload()}
                type="button"
                className="route-error-btn-reload"
              >
                <RefreshCw className="route-error-btn-reload-icon" />
                Reload Application
              </button>

              {/* Back to Home Action */}
              <button
                onClick={() => navigate(ROUTES.HOME, { replace: true })}
                type="button"
                className="route-error-btn-home"
              >
                <Home className="route-error-btn-home-icon" />
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>

        {/* Terminal Footer Info */}
        <p className="route-error-footer-text">EXCEPTION_ID: {exceptionId}</p>
      </div>
    </div>
  );
};
