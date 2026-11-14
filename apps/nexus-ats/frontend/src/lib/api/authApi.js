// apps/nexus-ats/frontend/src/lib/api/authApi.js

import { apiClient } from "./client";

export const authApi = {
  /**
   * 1-Click Evaluator pass as Lead Recruiter Alex Sterling
   */
  demoLogin: async () => {
    return apiClient("/auth/demo", { method: "POST" });
  },

  /**
   * Standard email and password login
   */
  login: async (credentials) => {
    return apiClient("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  /**
   * Retrieve active authenticated recruiter session profile
   */
  getMe: async () => {
    return apiClient("/auth/me", { method: "GET" });
  },

  /**
   * Terminate recruiter session and clear cookie
   */
  logout: async () => {
    return apiClient("/auth/logout", { method: "POST" });
  },
};
