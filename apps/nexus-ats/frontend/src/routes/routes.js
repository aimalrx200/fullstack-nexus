// apps/nexus-ats/frontend/src/routes/routes.js

export const ROUTES = {
  HOME: "/",
  JOB_DETAIL: (slug = ":slug") => `/jobs/${slug}`,
  LOGIN: "/login",
  ADMIN: {
    ROOT: "/admin",
    PIPELINE: "/admin/pipeline",
    JOBS: "/admin/jobs",
    DASHBOARD: "/admin/dashboard",
  },
  NOT_FOUND: "*",
};
