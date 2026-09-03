// src/lib/api/client.js

import axios from "axios";
import { PUBLIC_API_ENDPOINTS, queryClient } from "./query";

const INSTANCE_KEY = "client_instance_id";

const generateId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

const getOrCreateInstanceId = () => {
  if (typeof window === "undefined") return "";

  try {
    let instanceId = sessionStorage.getItem(INSTANCE_KEY);

    if (!instanceId) {
      instanceId = generateId();
      sessionStorage.setItem(INSTANCE_KEY, instanceId);
    }

    return instanceId;
  } catch {
    return generateId();
  }
};

getOrCreateInstanceId();

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const instanceId = getOrCreateInstanceId();

  if (instanceId) {
    config.headers["x-client-instance-id"] = instanceId;
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    config.headers["x-request-id"] = crypto.randomUUID();
  } else {
    config.headers["x-request-id"] = generateId();
  }

  config.headers["x-request-timestamp"] = Date.now().toString();

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const rawUrl = originalRequest.url || "";
    let cleanPath = rawUrl.split("?")[0];

    if (
      originalRequest.baseURL &&
      cleanPath.startsWith(originalRequest.baseURL)
    ) {
      cleanPath = cleanPath.replace(originalRequest.baseURL, "");
    }

    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }
    if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
      cleanPath = cleanPath.slice(0, -1);
    }

    const isPublicEndpoint = PUBLIC_API_ENDPOINTS.includes(cleanPath);

    if (originalRequest._skipAuthInterceptor || isPublicEndpoint) {
      return Promise.reject(error);
    }

    // Retry on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { authManager } = await import("../auth/AuthManager");
        await authManager.refreshToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 🟢 Set authUser to null without calling queryClient.clear() to avoid aborting in-flight loaders
        queryClient.setQueryData(["authUser"], null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
