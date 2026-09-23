// apps/nexus-commerce/frontend/src/lib/api/client.js

import axios from "axios";
import { env } from "../../config/env";
import { STORAGE_KEYS } from "../../config/constants";
import { AuthManager } from "../auth/AuthManager";
import { store } from "../../redux/store";
import {
  startLoading,
  stopLoading,
  finalizeLoading,
  hideLoading,
  resetLoading,
} from "../../redux/slices/uiSlice";

const getGuestSessionId = () => {
  let id = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, id);
  }
  return id;
};

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
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let settleTimer = null;
let cleanupTimer = null;

const handleRequestStart = () => {
  if (settleTimer) clearTimeout(settleTimer);
  if (cleanupTimer) clearTimeout(cleanupTimer);
  store.dispatch(startLoading());
};

const handleRequestEnd = () => {
  store.dispatch(stopLoading());

  if (settleTimer) clearTimeout(settleTimer);
  if (cleanupTimer) clearTimeout(cleanupTimer);

  // 350ms bridging window holds the bar open while the target page mounts and queries fetch
  settleTimer = setTimeout(() => {
    store.dispatch(finalizeLoading());

    cleanupTimer = setTimeout(() => {
      store.dispatch(hideLoading());
      setTimeout(() => {
        store.dispatch(resetLoading());
      }, 300);
    }, 200);
  }, 350);
};

// 1. Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers["x-request-id"] =
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    config.headers["x-request-timestamp"] = String(Date.now());
    config.headers["x-client-instance-id"] = getClientInstanceId();
    config.headers["x-guest-session-id"] = getGuestSessionId();

    handleRequestStart();
    return config;
  },
  (error) => {
    handleRequestEnd();
    return Promise.reject(error);
  },
);

let refreshPromise = null;

const executeSingleFlightRefresh = async () => {
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

// 2. Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    handleRequestEnd();
    return response;
  },
  async (error) => {
    handleRequestEnd();
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      originalRequest._retry = true;

      try {
        await executeSingleFlightRefresh();
        return apiClient(originalRequest);
      } catch (refreshErr) {
        if (!originalRequest.url?.includes("/auth/me")) {
          AuthManager.notifySessionTerminated();
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
