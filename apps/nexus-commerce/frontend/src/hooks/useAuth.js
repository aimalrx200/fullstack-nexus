// apps/nexus-commerce/frontend/src/hooks/useAuth.js
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

  useEffect(() => {
    if (isSuccess && fetchedUser) {
      if (
        !user ||
        user._id !== fetchedUser._id ||
        user.isEmailVerified !== fetchedUser.isEmailVerified ||
        user.role !== fetchedUser.role
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

  const role = user?.role || "customer";
  const isSuperAdmin = role === "super_admin";
  const isMerchantAdmin = role === "merchant_admin" || isSuperAdmin;
  const isSupportAgent = role === "support_agent" || isMerchantAdmin;
  const isStaff = isSupportAgent || isMerchantAdmin || isSuperAdmin;

  return {
    user,
    isAuthenticated,
    isInitialized,
    role,
    isSuperAdmin,
    isMerchantAdmin,
    isSupportAgent,
    isStaff,
    isEmailVerified: Boolean(user?.isEmailVerified),
    logout: useCallback(() => logoutMutation.mutate(), [logoutMutation]),
    demoLogin: useCallback(
      (r) => demoLoginMutation.mutate(r),
      [demoLoginMutation],
    ),
    isLoggingOut: logoutMutation.isPending,
    isDemoLoggingIn: demoLoginMutation.isPending,
    markVerified: useCallback(() => dispatch(setUserVerified()), [dispatch]),
    refetchUser,
  };
}
