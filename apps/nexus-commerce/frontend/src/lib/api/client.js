import axios from "axios";
import { env } from "../../config/env";
import { STORAGE_KEYS } from "../../config/constants";
import { AuthManager } from "../auth/AuthManager";

// Generate or retrieve persistent guest tracking ID
const getGuestSessionId = () => {
  let id = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, id);
  }
  return id;
};

// Unique instance ID for this specific browser tab
const getClientInstanceId = () => {
  let id = sessionStorage.getItem(STORAGE_KEYS.CLIENT_INSTANCE_ID);
  if (!id) {
    id = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(STORAGE_KEYS.CLIENT_INSTANCE_ID, id);
  }
  return id;
};

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true, // Guarantees signed httpOnly cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// =============================================================================
// REQUEST INTERCEPTOR: Inject Tracing & Telemetry Headers
// =============================================================================
apiClient.interceptors.request.use(
  (config) => {
    config.headers["x-request-id"] =
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    config.headers["x-request-timestamp"] = String(Date.now());
    config.headers["x-client-instance-id"] = getClientInstanceId();
    config.headers["x-guest-session-id"] = getGuestSessionId();
    return config;
  },
  (error) => Promise.reject(error),
);

// =============================================================================
// RESPONSE INTERCEPTOR: Web Locks API Single-Flight Token Refresh
// =============================================================================
let refreshPromise = null;

const executeSingleFlightRefresh = async () => {
  // 1. Modern Web Locks API (Guarantees only ONE tab refreshes tokens at a time)
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("nexus_token_refresh_lock", async () => {
      const response = await axios.post(
        `${env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      AuthManager.notifyRefreshSuccess();
      return response.data;
    });
  }

  // 2. In-Memory Promise Fallback for older browsers
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        AuthManager.notifyRefreshSuccess();
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      originalRequest._retry = true;

      try {
        await executeSingleFlightRefresh();
        // Retry original network request with fresh cookies
        return apiClient(originalRequest);
      } catch (refreshErr) {
        AuthManager.notifySessionTerminated();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
