// src/lib/auth/AuthManager.js

import { apiClient } from "../api/client";
import { API_ENDPOINTS, queryClient } from "../api/query";

class AuthManager {
  constructor() {
    this.channel = new BroadcastChannel("auth_sync_channel");
    this.lastRefreshTimestamp = 0;
    this.refreshPromise = null;
    this.isTerminating = false;
    this.setupListeners();
  }

  setupListeners() {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case "SESSION_LOGIN": {
          this.isTerminating = false;

          // 🟢 1. Completely clear previous user's cached secrets, logs, and state
          queryClient.clear();

          if (payload?.authPayload) {
            queryClient.setQueryData(["authUser"], payload.authPayload);
            queryClient.invalidateQueries();
          }
          break;
        }

        case "SESSION_REFRESHED":
          this.lastRefreshTimestamp = payload?.timestamp || Date.now();
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          break;

        case "SESSION_TERMINATED":
          this.cleanupClientSession();
          break;

        default:
          break;
      }
    };
  }

  /**
   * 🟢 Broadcasts successful login and forces clean cache reset
   */
  notifyLoginSuccess(authPayload) {
    this.isTerminating = false;

    // 1. Wipe all query cache immediately to prevent cross-account data leaks
    queryClient.clear();

    // 2. Set new active user context
    queryClient.setQueryData(["authUser"], authPayload);

    // 3. Broadcast to all open browser tabs
    this.channel.postMessage({
      type: "SESSION_LOGIN",
      payload: { authPayload },
    });
  }

  /**
   * Refreshes JWT token with Web Locks API & in-memory single-flight deduplication.
   */
  async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const requestTime = Date.now();

    if (typeof window !== "undefined" && "locks" in navigator) {
      this.refreshPromise = navigator.locks
        .request("auth_refresh_lock", async () => {
          if (this.lastRefreshTimestamp > requestTime) {
            return { skipped: true };
          }
          return await this.executeRefreshCall();
        })
        .finally(() => {
          this.refreshPromise = null;
        });

      return this.refreshPromise;
    }

    this.refreshPromise = this.executeRefreshCall().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async executeRefreshCall() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, null, {
        _skipAuthInterceptor: true,
      });

      const data = response.data;
      const timestamp = Date.now();
      this.lastRefreshTimestamp = timestamp;

      this.channel.postMessage({
        type: "SESSION_REFRESHED",
        payload: { ...data, timestamp },
      });

      return data;
    } catch (error) {
      this.cleanupClientSession();
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.terminateSession(false).catch(() => {});
      }
      throw error;
    }
  }

  /**
   * 🟢 Total cache eviction on logout
   */
  cleanupClientSession() {
    queryClient.clear();
    queryClient.setQueryData(["authUser"], null);
  }

  async terminateSession(notifyServer = true) {
    if (this.isTerminating) return;
    this.isTerminating = true;

    let serverResponse = null;

    try {
      if (notifyServer) {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
          _skipAuthInterceptor: true,
        });

        serverResponse = response.data;
      }
    } catch {
      // Silently ignore network/server errors during logout
    } finally {
      this.channel.postMessage({ type: "SESSION_TERMINATED" });
      this.cleanupClientSession();
      this.isTerminating = false;
    }

    return serverResponse;
  }
}

export const authManager = new AuthManager();
