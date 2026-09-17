import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  setCredentials,
  clearCredentials,
  setUserVerified,
  setInitialized,
} from "../redux/slices/authSlice";
import { authApi } from "../lib/api/authApi";
import { queryKeys } from "../lib/api/queryKeys";
import { AuthManager } from "../lib/auth/AuthManager";
import { toast } from "sonner";

export function useAuth() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth,
  );

  // Query authenticated profile on initial mount
  const { refetch: refetchUser } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const userData = await authApi.getMe();
        dispatch(setCredentials(userData));
        return userData;
      } catch (err) {
        dispatch(clearCredentials());
        throw err;
      } finally {
        dispatch(setInitialized());
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Cross-tab broadcast synchronization
  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((type, payload) => {
      if (type === "AUTH_LOGIN") {
        dispatch(setCredentials(payload));
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      } else if (type === "AUTH_LOGOUT") {
        dispatch(clearCredentials());
        queryClient.clear();
      } else if (type === "AUTH_REFRESHED") {
        refetchUser();
      }
    });

    return unsubscribe;
  }, [dispatch, queryClient, refetchUser]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();
      toast.success("Signed out successfully");
    },
    onError: () => {
      dispatch(clearCredentials());
      queryClient.clear();
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: (role) => authApi.demoLogin(role),
    onSuccess: (data) => {
      dispatch(setCredentials(data.user));
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success(data.message || `Signed in as Demo ${data.user.role}`);
    },
  });

  const isAdmin = user?.role === "merchant_admin";

  return {
    user,
    isAuthenticated,
    isInitialized,
    isAdmin,
    isEmailVerified: Boolean(user?.isEmailVerified),
    logout: () => logoutMutation.mutate(),
    demoLogin: (role) => demoLoginMutation.mutate(role),
    isLoggingOut: logoutMutation.isPending,
    isDemoLoggingIn: demoLoginMutation.isPending,
    markVerified: () => dispatch(setUserVerified()),
    refetchUser,
  };
}
