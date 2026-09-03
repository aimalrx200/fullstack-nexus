// src/lib/api/authApi.js

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./query";

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return response.data;
  },

  demoLogin: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.DEMO);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData,
    );
    return response.data;
  },

  googleAuth: async (authCode) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, {
      code: authCode,
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      payload,
    );
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, null, {
      _skipAuthInterceptor: true,
    });
    return response.data;
  },

  checkAuth: async (config = {}) => {
    const response = await apiClient.get(
      API_ENDPOINTS.CHECK.AUTH_CHECK,
      config,
    );
    return response.data;
  },
};
