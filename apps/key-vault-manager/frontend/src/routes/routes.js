// src/routes/routes.js

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VAULT: {
    PRODUCTION: "/vault/production",
    STAGING: "/vault/staging",
    DEVELOPMENT: "/vault/development",
  },
  ACCESS: "/access",
  AUDIT_LOGS: "/audit-logs",
  MACHINE_IDENTITIES: "/machine-identities",
  SYSTEM_ENGINE: "/system-engine",
  NOT_FOUND: "*",
};
