// apps/nexus-commerce/frontend/src/lib/auth/rbacNav.js

import { ROUTES } from "../../routes/routes";

/**
 * Normalizes user role string to standard lowercase.
 */
export function normalizeRole(role) {
  if (!role) return "customer";
  return String(role).toLowerCase().trim();
}

/**
 * Resolves the primary dashboard route for any 4-tier role.
 * @param {string} role - 'super_admin' | 'merchant_admin' | 'support_agent' | 'customer'
 * @returns {string} Target route URL
 */
export function getRoleDefaultRoute(role) {
  const cleanRole = normalizeRole(role);
  switch (cleanRole) {
    case "super_admin":
    case "merchant_admin":
      return ROUTES.ADMIN_DASHBOARD; // /admin
    case "support_agent":
      return ROUTES.ADMIN_SUPPORT; // /admin/support
    case "customer":
    default:
      return ROUTES.HOME; // /
  }
}

/**
 * Evaluates whether a target route is authorized for a given user role.
 */
export function isRouteAllowedForRole(role, targetPath) {
  if (!targetPath || typeof targetPath !== "string") return false;
  const cleanRole = normalizeRole(role);
  const path = targetPath.toLowerCase().trim();

  // Auth pages are not valid return targets
  if (
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/verify-email"
  ) {
    return false;
  }

  // Super Admin can access all routes
  if (cleanRole === "super_admin") return true;

  // Merchant Admin can access all admin and storefront routes except staff management
  if (cleanRole === "merchant_admin") {
    return !path.startsWith("/admin/staff");
  }

  // Support Agent can only access /admin/support, /admin/customers, and storefront
  if (cleanRole === "support_agent") {
    if (path.startsWith("/admin")) {
      return (
        path.startsWith("/admin/support") || path.startsWith("/admin/customers")
      );
    }
    return true;
  }

  // Customer can never access /admin routes
  if (cleanRole === "customer") {
    return !path.startsWith("/admin");
  }

  return true;
}

/**
 * Adaptive 4-Tier RBAC Navigator with return-path preservation.
 * @param {Function} navigate - React Router navigate function
 * @param {Object} user - Authenticated user object
 * @param {Object} options - { isModal, from }
 */
export function navigateByRole(
  navigate,
  user,
  { isModal = false, from = null } = {},
) {
  const role = normalizeRole(user?.role);

  // 1. SUPER ADMIN & MERCHANT ADMIN -> ALWAYS /admin (unless navigating to a specific /admin sub-page)
  if (role === "super_admin" || role === "merchant_admin") {
    if (
      from &&
      typeof from === "string" &&
      from.startsWith("/admin") &&
      isRouteAllowedForRole(role, from)
    ) {
      navigate(from, { replace: true });
      return;
    }
    navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    return;
  }

  // 2. SUPPORT AGENT -> ALWAYS /admin/support (unless navigating to an allowed admin sub-page)
  if (role === "support_agent") {
    if (
      from &&
      typeof from === "string" &&
      from.startsWith("/admin") &&
      isRouteAllowedForRole(role, from)
    ) {
      navigate(from, { replace: true });
      return;
    }
    navigate(ROUTES.ADMIN_SUPPORT, { replace: true });
    return;
  }

  // 3. CUSTOMER
  // In a storefront modal: stay on current browsing page
  if (isModal) {
    return;
  }

  // If returning to an allowed customer page (e.g. /checkout, /account)
  if (
    from &&
    typeof from === "string" &&
    from !== "/" &&
    isRouteAllowedForRole(role, from)
  ) {
    navigate(from, { replace: true });
    return;
  }

  // Otherwise, route customer to Storefront Home
  navigate(ROUTES.HOME, { replace: true });
}
