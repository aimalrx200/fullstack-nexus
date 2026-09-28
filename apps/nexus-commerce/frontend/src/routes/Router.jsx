// apps/nexus-commerce/frontend/src/routes/Router.jsx

import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute, RoleGuard, GuestRoute } from "../lib/auth/guards";
import { DashboardSkeleton } from "../components/feedback/DashboardSkeleton";

// =============================================================================
// LAZY-LOADED PAGE CHUNKS
// =============================================================================

// 1. Storefront Pages
const HomePage = lazy(() =>
  import("../pages/storefront/HomePage").then((m) => ({ default: m.HomePage })),
);
const CatalogPage = lazy(() =>
  import("../pages/storefront/CatalogPage").then((m) => ({
    default: m.CatalogPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("../pages/storefront/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const CheckoutPage = lazy(() =>
  import("../pages/storefront/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const OrderTrackingPage = lazy(() =>
  import("../pages/storefront/OrderTrackingPage").then((m) => ({
    default: m.OrderTrackingPage,
  })),
);
const AccountPage = lazy(() =>
  import("../pages/storefront/AccountPage").then((m) => ({
    default: m.AccountPage,
  })),
);

// 2. Auth Pages
const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("../pages/auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/auth/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../pages/auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("../pages/auth/VerifyEmailPage").then((m) => ({
    default: m.VerifyEmailPage,
  })),
);

// 3. Admin & Staff Operations Pages
const AdminDashboardPage = lazy(() =>
  import("../pages/admin/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("../pages/admin/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  })),
);
const OrderFulfillmentPage = lazy(() =>
  import("../pages/admin/OrderFulfillmentPage").then((m) => ({
    default: m.OrderFulfillmentPage,
  })),
);
const InventoryManagerPage = lazy(() =>
  import("../pages/admin/InventoryManagerPage").then((m) => ({
    default: m.InventoryManagerPage,
  })),
);
const CouponManagerPage = lazy(() =>
  import("../pages/admin/CouponManagerPage").then((m) => ({
    default: m.CouponManagerPage,
  })),
);
const CustomerDirectoryPage = lazy(() =>
  import("../pages/admin/CustomerDirectoryPage").then((m) => ({
    default: m.CustomerDirectoryPage,
  })),
);
const SupportDeskPage = lazy(() =>
  import("../pages/admin/SupportDeskPage").then((m) => ({
    default: m.SupportDeskPage,
  })),
);
const StaffManagerPage = lazy(() =>
  import("../pages/admin/StaffManagerPage").then((m) => ({
    default: m.StaffManagerPage,
  })),
);

// Storefront minimal fallback: zero layout shifts or spinner flickers during chunk load
function StorefrontSuspenseFallback() {
  return <div className="min-h-[60vh] w-full" aria-busy="true" />;
}

// Admin layout fallback: structured dashboard skeleton
function AdminSuspenseFallback() {
  return null;
}

function RootLayout() {
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // =======================================================================
      // 1. STOREFRONT (Seamless, Persistent Navbar/Footer Shell)
      // =======================================================================
      {
        path: "/",
        element: <StorefrontLayout />,
        children: [
          {
            element: (
              <Suspense fallback={<StorefrontSuspenseFallback />}>
                <Outlet />
              </Suspense>
            ),
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
        ],
      },

      // =======================================================================
      // 2. AUTHENTICATION
      // =======================================================================
      {
        element: <AuthLayout />,
        children: [
          {
            element: (
              <Suspense fallback={<div className="min-h-75" />}>
                <Outlet />
              </Suspense>
            ),
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
        ],
      },

      // =======================================================================
      // 3. ADMIN & STAFF CONTROL CENTER (Persistent Shell + Skeleton Grids)
      // =======================================================================
      {
        path: "/admin",
        element: (
          <RoleGuard
            allowedRoles={["support_agent", "merchant_admin", "super_admin"]}
          />
        ),
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                element: (
                  <Suspense fallback={<AdminSuspenseFallback />}>
                    <Outlet />
                  </Suspense>
                ),
                children: [
                  // Support & Customers (Shared Staff)
                  { path: "support", element: <SupportDeskPage /> },
                  { path: "customers", element: <CustomerDirectoryPage /> },

                  // Merchant Operations & Analytics
                  {
                    element: (
                      <RoleGuard
                        allowedRoles={["merchant_admin", "super_admin"]}
                      />
                    ),
                    children: [
                      { index: true, element: <AdminDashboardPage /> },
                      { path: "analytics", element: <AnalyticsPage /> },
                      { path: "orders", element: <OrderFulfillmentPage /> },
                      { path: "inventory", element: <InventoryManagerPage /> },
                      { path: "coupons", element: <CouponManagerPage /> },
                    ],
                  },

                  // Super Admin Staff Governance
                  {
                    element: <RoleGuard allowedRoles={["super_admin"]} />,
                    children: [
                      { path: "staff", element: <StaffManagerPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
