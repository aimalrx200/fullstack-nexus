// apps/nexus-ats/frontend/src/lib/auth/guards.jsx

import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router";
import { AUTH_STATUS } from "@/redux/slices/authSlice";
import styles from "./guards.module.css";

/**
 * Protects admin routes.
 * Blocks premature redirects while the session is initializing.
 */
export function ProtectedRoute({ children }) {
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  // Initialization Gate: Wait for session check to complete before evaluating redirect
  if (status === AUTH_STATUS.INITIALIZING) {
    return (
      <div className={styles.guardLoader} aria-label="Loading workspace">
        <div className={styles.spinner} />
      </div>
    );
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

/**
 * Protects guest-only routes like /login.
 * If already authenticated, redirects straight to the pipeline.
 */
export function GuestRoute({ children }) {
  const { status } = useSelector((state) => state.auth);

  if (status === AUTH_STATUS.INITIALIZING) {
    return null;
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
