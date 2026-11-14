// apps/nexus-ats/frontend/src/lib/api/analyticsApi.js

import { apiClient } from "./client";

export const analyticsApi = {
  /**
   * Fetch aggregated recruitment metrics for Overview & Analytics page
   */
  getOverview: async () => {
    return apiClient("/analytics/overview", { method: "GET" });
  },
};
