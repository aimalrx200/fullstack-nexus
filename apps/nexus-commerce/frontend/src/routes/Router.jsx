import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute, AdminRoute, GuestRoute } from "../lib/auth/guards";

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

// Admin Pages
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AnalyticsPage } from "../pages/admin/AnalyticsPage";
import { OrderFulfillmentPage } from "../pages/admin/OrderFulfillmentPage";
import { InventoryManagerPage } from "../pages/admin/InventoryManagerPage";
import { CouponManagerPage } from "../pages/admin/CouponManagerPage";
import { CustomerDirectoryPage } from "../pages/admin/CustomerDirectoryPage";
import { SupportDeskPage } from "../pages/admin/SupportDeskPage";

const router = createBrowserRouter([
  // 1. Storefront Routes
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

  // 2. Auth Routes
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

  // 3. Protected Merchant Control Center Routes
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "orders", element: <OrderFulfillmentPage /> },
          { path: "inventory", element: <InventoryManagerPage /> },
          { path: "coupons", element: <CouponManagerPage /> },
          { path: "customers", element: <CustomerDirectoryPage /> },
          { path: "support", element: <SupportDeskPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
