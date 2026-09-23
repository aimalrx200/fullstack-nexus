// apps/nexus-commerce/frontend/src/lib/auth/guards.jsx

import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { getRoleDefaultRoute, normalizeRole, navigateByRole } from "./rbacNav";

/**
 * Role-Based Access Guard for Admin & Staff Tiers
 */
export function RoleGuard({ allowedRoles = [] }) {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const cleanRole = normalizeRole(user?.role);
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  const isAllowed =
    cleanRole === "super_admin" || normalizedAllowed.includes(cleanRole);

  if (!isAllowed) {
    const targetRoute = getRoleDefaultRoute(cleanRole);
    return <Navigate to={targetRoute} replace />;
  }

  return <Outlet />;
}

/**
 * Protected Route Guard for Customer Account & Order Pages
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

/**
 * Guest Route Guard for Login, Register, & Forgot Password
 * 1. Keeps <Outlet /> continuously rendered so the form card never empties during auth transitions.
 * 2. Uses adaptive role navigation to route already logged-in users directly to their dashboards.
 */
export function GuestRoute() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      navigateByRole(navigate, user);
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  return <Outlet />;
}
