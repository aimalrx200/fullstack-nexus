// apps/nexus-ats/frontend/src/lib/api/candidateApi.js

import { apiClient } from "./client";

export const candidateApi = {
  /**
   * Submit job application with PDF resume (multipart/form-data)
   * @param {FormData} formData - Contains jobId, name, email, phone, and resume file
   */
  applyForJob: async (formData) => {
    return apiClient("/candidates/apply", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Retrieve talent pool with optional filters (jobId, stage, search)
   */
  getCandidates: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== "all") {
        query.append(key, val);
      }
    });

    const queryString = query.toString();
    const endpoint = queryString ? `/candidates?${queryString}` : "/candidates";
    return apiClient(endpoint, { method: "GET" });
  },

  /**
   * Get single candidate dossier with timeline and scorecard
   */
  getCandidateById: async (id) => {
    return apiClient(`/candidates/${id}`, { method: "GET" });
  },

  /**
   * Kanban drag-and-drop: updates candidate stage and appends timeline log
   */
  updateStage: async (id, newStageId) => {
    return apiClient(`/candidates/${id}/stage`, {
      method: "PATCH",
      body: { newStageId },
    });
  },

  /**
   * Update 1-5 star competency rating
   */
  updateRating: async (id, score) => {
    return apiClient(`/candidates/${id}/rating`, {
      method: "PATCH",
      body: { score },
    });
  },

  /**
   * Update sub-criteria ratings and hiring recommendation
   */
  updateScorecard: async (id, scorecardData) => {
    return apiClient(`/candidates/${id}/scorecard`, {
      method: "PATCH",
      body: scorecardData,
    });
  },

  /**
   * Record recruiter interview feedback note
   */
  addNote: async (id, { text }) => {
    return apiClient(`/candidates/${id}/notes`, {
      method: "POST",
      body: { text },
    });
  },
};
