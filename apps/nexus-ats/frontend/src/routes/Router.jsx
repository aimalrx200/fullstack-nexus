// apps/nexus-ats/frontend/src/routes/Router.jsx

import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "./RootLayout";
import PublicLayout from "@/layouts/PublicLayout";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";
import { ProtectedRoute, GuestRoute } from "@/lib/auth/guards";
import { ROUTES } from "./routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      /* Public Candidate Experience */
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { default: JobBoardPage } =
                await import("@/pages/public/JobBoardPage");
              return { Component: JobBoardPage };
            },
          },
          {
            path: "jobs/:slug",
            lazy: async () => {
              const { default: JobDetailPage } =
                await import("@/pages/public/JobDetailPage");
              return { Component: JobDetailPage };
            },
          },
          /* Catch-all 404 Experience */
          {
            path: "*",
            lazy: async () => {
              const { default: NotFoundPage } =
                await import("@/pages/public/NotFoundPage");
              return { Component: NotFoundPage };
            },
          },
        ],
      },

      /* Recruiter Authentication (Guest Only) */
      {
        path: ROUTES.LOGIN,
        element: (
          <GuestRoute>
            <PublicLayout />
          </GuestRoute>
        ),
        children: [
          {
            index: true,
            lazy: async () => {
              const { default: LoginPage } =
                await import("@/pages/auth/LoginPage");
              return { Component: LoginPage };
            },
          },
        ],
      },

      /* Protected Recruiter Portal */
      {
        path: ROUTES.ADMIN.ROOT,
        element: (
          <ProtectedRoute>
            <RecruiterLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
          },
          {
            path: "dashboard",
            lazy: async () => {
              const { default: AdminDashboardPage } =
                await import("@/pages/admin/AdminDashboardPage");
              return { Component: AdminDashboardPage };
            },
          },
          {
            path: "pipeline",
            lazy: async () => {
              const { default: PipelinePage } =
                await import("@/pages/admin/PipelinePage");
              return { Component: PipelinePage };
            },
          },
          {
            path: "jobs",
            lazy: async () => {
              const { default: JobManagerPage } =
                await import("@/pages/admin/JobManagerPage");
              return { Component: JobManagerPage };
            },
          },
        ],
      },
    ],
  },
]);
