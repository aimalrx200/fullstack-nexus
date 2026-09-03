// src/lib/api/vaultApi.js

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./query";

export const vaultApi = {
  getSecrets: async (namespace = "Production") => {
    const response = await apiClient.get(API_ENDPOINTS.VAULT.SECRETS, {
      params: { namespace },
    });
    return response.data;
  },

  revealSecret: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.VAULT.REVEAL(id));
    return response.data;
  },

  createSecret: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.SECRETS, payload);
    return response.data;
  },

  rotateSecret: async ({ id, newValue }) => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.ROTATE(id), {
      newValue,
    });
    return response.data;
  },

  renewLease: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.RENEW(id));
    return response.data;
  },

  revokeLease: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.REVOKE(id));
    return response.data;
  },

  deleteSecret: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.VAULT.DELETE(id));
    return response.data;
  },

  getAuditLogs: async (limit = 50) => {
    const response = await apiClient.get(API_ENDPOINTS.VAULT.AUDIT_LOGS, {
      params: { limit },
    });
    return response.data;
  },

  resetDemoVault: async () => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.RESET_DEMO);
    return response.data;
  },

  simulateAttack: async () => {
    const response = await apiClient.post(API_ENDPOINTS.VAULT.SIMULATE_ATTACK);
    return response.data;
  },
};
