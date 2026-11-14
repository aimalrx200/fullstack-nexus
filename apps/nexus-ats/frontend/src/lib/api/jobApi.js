// apps/nexus-ats/frontend/src/lib/api/jobApi.js

import { apiClient } from "./client";

export const jobApi = {
  /**
   * List jobs with optional filtering (department, workplaceType, status, search)
   */
  getJobs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (
        val &&
        val !== "all" &&
        val !== "All Departments" &&
        val !== "All Locations" &&
        val !== "All Statuses"
      ) {
        query.append(key, val);
      }
    });

    const queryString = query.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : "/jobs";
    return apiClient(endpoint, { method: "GET" });
  },

  /**
   * Get job by unique slug or ObjectId
   */
  getJobBySlugOrId: async (slugOrId) => {
    return apiClient(`/jobs/${slugOrId}`, { method: "GET" });
  },

  /**
   * Publish a new job requisition (Recruiter protected)
   */
  createJob: async (jobData) => {
    return apiClient("/jobs", {
      method: "POST",
      body: jobData,
    });
  },

  /**
   * Update role status: Active | Paused | Archived (Recruiter protected)
   */
  updateJobStatus: async (jobId, status) => {
    return apiClient(`/jobs/${jobId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
