// src/lib/auth/useAuthUser.js

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/query";

export const useAuthUser = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.CHECK.AUTH_CHECK, {
          _skipAuthInterceptor: true,
        });

        return response.data?.user || response.data;
      } catch (error) {
        const status = error?.response?.status;
        if (
          status === 401 ||
          status === 403 ||
          error?.name === "CancelledError" ||
          error?.message?.includes("cancelled")
        ) {
          return null;
        }

        throw error;
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
  });
};
