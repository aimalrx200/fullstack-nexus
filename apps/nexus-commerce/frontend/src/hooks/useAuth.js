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
import { setCartState } from "../redux/slices/cartSlice";
import { authApi } from "../lib/api/authApi";
import { cartApi } from "../lib/api/cartApi";
import { queryKeys } from "../lib/api/queryKeys";
import { AuthManager } from "../lib/auth/AuthManager";
import { STORAGE_KEYS } from "../config/constants";
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

  // ⚡ Helper: Auto-merge guest cart into authenticated account
  const triggerGuestCartMerge = useCallback(async () => {
    const guestId = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
    if (guestId) {
      try {
        const mergedData = await cartApi.mergeGuestCart(guestId);
        if (mergedData?.cart) {
          dispatch(setCartState(mergedData));
          queryClient.setQueryData(queryKeys.cart.current(), mergedData);
        }
      } catch (err) {
        console.warn("Guest cart auto-merge skipped:", err);
      }
    }
  }, [dispatch, queryClient]);

  useEffect(() => {
    if (isSuccess && fetchedUser) {
      if (
        !user ||
        user._id !== fetchedUser._id ||
        user.isEmailVerified !== fetchedUser.isEmailVerified ||
        user.role !== fetchedUser.role
      ) {
        dispatch(setCredentials(fetchedUser));
        triggerGuestCartMerge();
      }
    } else if (isError) {
      if (user) {
        dispatch(clearCredentials());
      }
      dispatch(setInitialized());
    } else if (!isLoading) {
      dispatch(setInitialized());
    }
  }, [
    isSuccess,
    isError,
    isLoading,
    fetchedUser,
    user,
    dispatch,
    triggerGuestCartMerge,
  ]);

  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((type, payload) => {
      if (type === "AUTH_LOGIN") {
        dispatch(setCredentials(payload));
        queryClient.setQueryData(queryKeys.auth.me(), payload);
        triggerGuestCartMerge();
      } else if (type === "AUTH_LOGOUT") {
        dispatch(clearCredentials());
        queryClient.setQueryData(queryKeys.auth.me(), null);
      } else if (type === "AUTH_REFRESHED") {
        refetchUser();
      }
    });

    return unsubscribe;
  }, [dispatch, queryClient, refetchUser, triggerGuestCartMerge]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
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
      triggerGuestCartMerge();
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
    isAdmin: isMerchantAdmin,
    isEmailVerified: Boolean(user?.isEmailVerified),
    logout: useCallback(async () => {
      try {
        await logoutMutation.mutateAsync();
      } catch {
        // Handled in mutation onError
      }
    }, [logoutMutation]),
    demoLogin: useCallback(
      async (r) => {
        const data = await demoLoginMutation.mutateAsync(r);
        return data.user;
      },
      [demoLoginMutation],
    ),
    isLoggingOut: logoutMutation.isPending,
    isDemoLoggingIn: demoLoginMutation.isPending,
    markVerified: useCallback(() => dispatch(setUserVerified()), [dispatch]),
    refetchUser,
    triggerGuestCartMerge,
  };
}
