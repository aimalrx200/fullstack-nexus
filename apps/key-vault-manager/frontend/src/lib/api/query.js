// src/lib/api/query.js

import { QueryClient } from "@tanstack/react-query";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    DEMO: "/auth/demo",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    GOOGLE: "/auth/google",
  },
  CHECK: {
    AUTH_CHECK: "/check/auth-check",
  },
  VAULT: {
    SECRETS: "/vault/secrets",
    REVEAL: (id) => `/vault/secrets/${id}/reveal`,
    ROTATE: (id) => `/vault/secrets/${id}/rotate`,
    RENEW: (id) => `/vault/secrets/${id}/renew`,
    REVOKE: (id) => `/vault/secrets/${id}/revoke`,
    DELETE: (id) => `/vault/secrets/${id}`,
    AUDIT_LOGS: "/vault/audit-logs",
    RESET_DEMO: "/vault/reset-demo",
    SIMULATE_ATTACK: "/vault/simulate-attack",
  },
};

export const PUBLIC_API_ENDPOINTS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.DEMO,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
  API_ENDPOINTS.AUTH.VERIFY_EMAIL,
  API_ENDPOINTS.AUTH.GOOGLE,
];

export const GUEST_UI_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const envSuffix =
  import.meta.env.VITE_APP_ENV === "production" ? "PROD" : "DEV";

const getEnvNum = (key, fallback) => {
  const value = Number(import.meta.env[`VITE_QUERY_${key}_${envSuffix}`]);
  return Number.isNaN(value) || value <= 0 ? fallback : value;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: getEnvNum("STALE_TIME", 30000),
      gcTime: getEnvNum("GC_TIME", 90000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
