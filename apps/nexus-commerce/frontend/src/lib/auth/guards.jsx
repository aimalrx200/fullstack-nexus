// apps/nexus-commerce/frontend/src/lib/auth/guards.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/feedback/LoadingSpinner";

export function RoleGuard({ allowedRoles = [], fallbackPath = "/login" }) {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app">
        <LoadingSpinner size="lg" label="Verifying access credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || "customer";
  const isAllowed =
    userRole === "super_admin" || allowedRoles.includes(userRole);

  if (!isAllowed) {
    const defaultFallback =
      userRole === "support_agent" ? "/admin/support" : "/";
    return <Navigate to={fallbackPath || defaultFallback} replace />;
  }

  return <Outlet />;
}

export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app">
        <LoadingSpinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app">
        <LoadingSpinner size="lg" label="Initializing..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
