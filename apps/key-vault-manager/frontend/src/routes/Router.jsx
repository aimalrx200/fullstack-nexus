// src/routes/Router.jsx

import { createBrowserRouter } from "react-router";
import { RootLayout } from "./RootLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import {
  ProtectedRoute,
  GuestRoute,
  FullPageSpinner,
} from "../lib/auth/guards";
import { RouteErrorBoundary } from "../components/error-element/RouteErrorBoundary";
import { queryClient } from "../lib/api/query";
import { authApi } from "../lib/api/authApi";
import { ROUTES } from "./routes";

const rootLoader = async () => {
  try {
    return await queryClient.ensureQueryData({
      queryKey: ["authUser"],
      queryFn: async () => {
        try {
          const res = await authApi.checkAuth({ _skipAuthInterceptor: true });
          return res?.user || res;
        } catch (error) {
          const status = error?.response?.status;
          if (
            status === 401 ||
            status === 403 ||
            error?.name === "CancelledError" ||
            error?.message?.includes("cancelled")
          ) {
            return null;
          }
          throw error;
        }
      },
      staleTime: Infinity,
    });
  } catch (error) {
    if (
      error?.name === "CancelledError" ||
      error?.message?.includes("cancelled") ||
      error?.response?.status === 401 ||
      error?.response?.status === 403
    ) {
      return null;
    }
    throw error;
  }
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    loader: rootLoader,
    HydrateFallback: FullPageSpinner,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            id: "login",
            path: ROUTES.LOGIN,
            lazy: () =>
              import("../components/auth/Login").then((m) => ({
                Component: m.Login,
              })),
          },
          {
            id: "register",
            path: ROUTES.REGISTER,
            lazy: () =>
              import("../components/auth/Register").then((m) => ({
                Component: m.Register,
              })),
          },
          {
            id: "verify-email",
            path: ROUTES.VERIFY_EMAIL,
            lazy: () =>
              import("../components/auth/VerifyEmail").then((m) => ({
                Component: m.VerifyEmail,
              })),
          },
          {
            id: "forgot-password",
            path: ROUTES.FORGOT_PASSWORD,
            lazy: () =>
              import("../components/auth/ForgotPassword").then((m) => ({
                Component: m.ForgotPassword,
              })),
          },
          {
            id: "reset-password",
            path: ROUTES.RESET_PASSWORD,
            lazy: () =>
              import("../components/auth/ResetPassword").then((m) => ({
                Component: m.ResetPassword,
              })),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            handle: { crumb: "Dashboard" },
            children: [
              {
                id: "overview",
                path: ROUTES.HOME,
                handle: { crumb: "Overview" },
                lazy: () =>
                  import("../pages/overview/OverviewPage").then((m) => ({
                    Component: m.OverviewPage,
                  })),
              },
              {
                id: "vault-production",
                path: ROUTES.VAULT.PRODUCTION,
                handle: { crumb: "Production Vault" },
                lazy: () =>
                  import("../pages/vault/ProductionVault").then((m) => ({
                    Component: m.ProductionVault,
                  })),
              },
              {
                id: "vault-staging",
                path: ROUTES.VAULT.STAGING,
                handle: { crumb: "Staging Vault" },
                lazy: () =>
                  import("../pages/vault/StagingVault").then((m) => ({
                    Component: m.StagingVault,
                  })),
              },
              {
                id: "vault-development",
                path: ROUTES.VAULT.DEVELOPMENT,
                handle: { crumb: "Development Vault" },
                lazy: () =>
                  import("../pages/vault/DevelopmentVault").then((m) => ({
                    Component: m.DevelopmentVault,
                  })),
              },
              {
                id: "zero-trust-access",
                path: ROUTES.ACCESS,
                handle: { crumb: "Zero-Trust Access" },
                lazy: () =>
                  import("../pages/access/ZeroTrustAccess").then((m) => ({
                    Component: m.ZeroTrustAccess,
                  })),
              },
              {
                id: "audit-logs",
                path: ROUTES.AUDIT_LOGS,
                handle: { crumb: "Compliance Audit Logs" },
                lazy: () =>
                  import("../pages/audit/ComplianceAuditLogs").then((m) => ({
                    Component: m.ComplianceAuditLogs,
                  })),
              },
              {
                id: "machine-identities",
                path: ROUTES.MACHINE_IDENTITIES,
                handle: { crumb: "Machine Identities" },
                lazy: () =>
                  import("../pages/identities/MachineIdentities").then((m) => ({
                    Component: m.MachineIdentities,
                  })),
              },
              {
                id: "system-engine",
                path: ROUTES.SYSTEM_ENGINE,
                handle: { crumb: "System Engine" },
                lazy: () =>
                  import("../pages/system/SystemEngine").then((m) => ({
                    Component: m.SystemEngine,
                  })),
              },
            ],
          },
        ],
      },
      {
        id: "not-found",
        path: ROUTES.NOT_FOUND,
        lazy: () =>
          import("../components/not-found/NotFound").then((m) => ({
            Component: m.NotFound,
          })),
      },
    ],
  },
]);
