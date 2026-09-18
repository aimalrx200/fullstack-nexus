import { useEffect, useCallback } from "react";
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

  // 1. Query authenticated profile on initial mount
  const {
    data: fetchedUser,
    isSuccess,
    isError,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      return await authApi.getMe();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Synchronize fetched user to Redux without triggering infinite query invalidation
  useEffect(() => {
    if (isSuccess && fetchedUser) {
      if (
        !user ||
        user._id !== fetchedUser._id ||
        user.isEmailVerified !== fetchedUser.isEmailVerified
      ) {
        dispatch(setCredentials(fetchedUser));
      }
    } else if (isError) {
      if (user) {
        dispatch(clearCredentials());
      }
      dispatch(setInitialized());
    } else if (!isLoading) {
      dispatch(setInitialized());
    }
  }, [isSuccess, isError, isLoading, fetchedUser, user, dispatch]);

  // 3. Cross-tab broadcast synchronization (Uses setQueryData to prevent refetch storms)
  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((type, payload) => {
      if (type === "AUTH_LOGIN") {
        dispatch(setCredentials(payload));
        queryClient.setQueryData(queryKeys.auth.me(), payload);
      } else if (type === "AUTH_LOGOUT") {
        dispatch(clearCredentials());
        queryClient.setQueryData(queryKeys.auth.me(), null);
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
      queryClient.setQueryData(queryKeys.auth.me(), null);
      toast.success("Signed out successfully");
    },
    onError: () => {
      dispatch(clearCredentials());
      queryClient.setQueryData(queryKeys.auth.me(), null);
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: (role) => authApi.demoLogin(role),
    onSuccess: (data) => {
      dispatch(setCredentials(data.user));
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      toast.success(data.message || `Signed in as Demo ${data.user.role}`);
    },
  });

  const markVerified = useCallback(() => {
    dispatch(setUserVerified());
  }, [dispatch]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const demoLogin = useCallback(
    (role) => {
      demoLoginMutation.mutate(role);
    },
    [demoLoginMutation],
  );

  const isAdmin = user?.role === "merchant_admin";

  return {
    user,
    isAuthenticated,
    isInitialized,
    isAdmin,
    isEmailVerified: Boolean(user?.isEmailVerified),
    logout,
    demoLogin,
    isLoggingOut: logoutMutation.isPending,
    isDemoLoggingIn: demoLoginMutation.isPending,
    markVerified,
    refetchUser,
  };
}
