import { createBrowserRouter, Navigate } from "react-router";
import PublicLayout from "@/layouts/PublicLayout";
import JobBoardPage from "@/pages/public/JobBoardPage";
import JobDetailPage from "@/pages/public/JobDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <JobBoardPage />,
      },
      {
        path: "jobs/:slug",
        element: <JobDetailPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
