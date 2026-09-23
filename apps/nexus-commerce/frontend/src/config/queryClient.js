// apps/nexus-commerce/frontend/src/config/queryClient.js

import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_STALE_TIMES } from "./constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIMES.STATIC_CATALOG,
      gcTime: 10 * 60 * 1000,
      // Suppresses intrusive progress bar triggers when switching browser tabs
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "An unexpected action error occurred.";
        toast.error(message);
      },
    },
  },
});
