// apps/nexus-ats/frontend/src/components/common/RouteErrorBoundary.jsx

import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import styles from "./RouteErrorBoundary.module.css";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Application Error";
  let message =
    "An unexpected client exception occurred while executing this route.";
  let technicalDetail = null;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} — ${error.statusText || "Route Exception"}`;
    message =
      error.data?.message ||
      "The requested route encounter an unexpected resolution failure.";
    technicalDetail = `Status: ${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
    technicalDetail = error.stack
      ? error.stack.split("\n").slice(0, 2).join(" ")
      : error.name;
  }

  return (
    <div className={styles.container} role="alert">
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={26} />
        </div>

        <h1 className={styles.title}>{title}</h1>

        <p className={styles.message}>{message}</p>

        {technicalDetail && (
          <div className={styles.errorBox}>{technicalDetail}</div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.homeBtn}
            onClick={() => navigate("/")}
          >
            <Home size={15} />
            <span>Return to Careers</span>
          </button>

          <button
            type="button"
            className={styles.reloadBtn}
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={15} />
            <span>Reload View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
