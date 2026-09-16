import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_STALE_TIMES } from "./constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIMES.STATIC_CATALOG,
      gcTime: 10 * 60 * 1000, // 10 minutes cache garbage collection
      refetchOnWindowFocus: (query) => {
        // Only auto-refetch dynamic state on focus
        return query.queryKey[0] === "cart" || query.queryKey[0] === "orders";
      },
      retry: (failureCount, error) => {
        // Do not retry 4xx operational errors
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
