// apps/nexus-commerce/frontend/src/routes/Router.jsx

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute, RoleGuard, GuestRoute } from "../lib/auth/guards";

// Storefront Pages
import { HomePage } from "../pages/storefront/HomePage";
import { CatalogPage } from "../pages/storefront/CatalogPage";
import { ProductDetailPage } from "../pages/storefront/ProductDetailPage";
import { CheckoutPage } from "../pages/storefront/CheckoutPage";
import { OrderTrackingPage } from "../pages/storefront/OrderTrackingPage";
import { AccountPage } from "../pages/storefront/AccountPage";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";

// Admin & Staff Pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AnalyticsPage } from "../pages/admin/AnalyticsPage";
import { OrderFulfillmentPage } from "../pages/admin/OrderFulfillmentPage";
import { InventoryManagerPage } from "../pages/admin/InventoryManagerPage";
import { CouponManagerPage } from "../pages/admin/CouponManagerPage";
import { CustomerDirectoryPage } from "../pages/admin/CustomerDirectoryPage";
import { SupportDeskPage } from "../pages/admin/SupportDeskPage";
import { StaffManagerPage } from "../pages/admin/StaffManagerPage"; // 👈 Added

const router = createBrowserRouter([
  // =========================================================================
  // 1. Storefront Routes (Public + Authenticated Customer)
  // =========================================================================
  {
    path: "/",
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "product/:slugOrId", element: <ProductDetailPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders/track/:orderId", element: <OrderTrackingPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "account", element: <AccountPage /> }],
      },
    ],
  },

  // =========================================================================
  // 2. Auth Routes (Guests Only)
  // =========================================================================
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },
      { path: "verify-email", element: <VerifyEmailPage /> },
    ],
  },

  // =========================================================================
  // 3. Admin & Staff Operations Control Center (4-Tier RBAC Gated)
  // =========================================================================
  {
    path: "/admin",
    // Base entry gate: Must have an active staff or administrative role
    element: (
      <RoleGuard
        allowedRoles={["support_agent", "merchant_admin", "super_admin"]}
      />
    ),
    children: [
      {
        element: <AdminLayout />,
        children: [
          // A. Shared Staff Pages (Support Agents + Merchant Admins + Super Admin)
          { path: "support", element: <SupportDeskPage /> },
          { path: "customers", element: <CustomerDirectoryPage /> },

          // B. Merchant Operations & Finance (Merchant Admins + Super Admin ONLY)
          {
            element: (
              <RoleGuard allowedRoles={["merchant_admin", "super_admin"]} />
            ),
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "analytics", element: <AnalyticsPage /> },
              { path: "orders", element: <OrderFulfillmentPage /> },
              { path: "inventory", element: <InventoryManagerPage /> },
              { path: "coupons", element: <CouponManagerPage /> },
            ],
          },

          // C. Root Owner Team Governance (Super Admin ONLY)
          {
            element: <RoleGuard allowedRoles={["super_admin"]} />,
            children: [{ path: "staff", element: <StaffManagerPage /> }],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
