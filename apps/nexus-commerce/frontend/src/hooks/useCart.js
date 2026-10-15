// src/hooks/useCart.js

import { useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import {
  setCartState,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  clearCartState,
} from "../redux/slices/cartSlice";
import {
  selectCartItems,
  selectCartItemCount,
  selectCartTotals,
  selectAppliedCoupon,
  selectIsCartDrawerOpen,
  selectActiveCartDisplayTotal,
} from "../redux/selectors/cartSelectors";
import { cartApi } from "../lib/api/cartApi";
import { queryKeys } from "../lib/api/queryKeys";
import { toast } from "sonner";

const EMPTY_CART_RESPONSE = {
  success: true,
  cart: { _id: null, items: [] },
  totals: {
    subtotalUSD: 0,
    subtotalPKR: 0,
    discountUSD: 0,
    discountPKR: 0,
    totalUSD: 0,
    totalPKR: 0,
    itemCount: 0,
  },
};

export function useCart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitialized } = useAuth();

  const cartId = useSelector((state) => state.cart.cartId);
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const totals = useSelector(selectCartTotals);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const isCartDrawerOpen = useSelector(selectIsCartDrawerOpen);
  const displayTotal = useSelector(selectActiveCartDisplayTotal);

  // Memoize query key so reference is stable across renders
  const cartQueryKey = useMemo(
    () => [...queryKeys.cart.current(), isAuthenticated ? user?._id : "guest"],
    [isAuthenticated, user?._id],
  );

  // Sync Cart with Backend only when auth initialization is complete
  const {
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    data: cartQueryData,
  } = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => cartApi.getCart(),
    enabled: isInitialized,
    staleTime: 1000 * 60 * 2,
  });

  // Keep Redux in sync with React Query safely
  useEffect(() => {
    if (cartQueryData) {
      dispatch(setCartState(cartQueryData));
    }
  }, [cartQueryData, dispatch]);

  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(cartQueryKey, data);
      toast.success("Added to shopping bag", {
        description: "Items locked for 10 minutes at checkout.",
      });
      dispatch(openCartDrawer());
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: cartApi.updateQuantity,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(cartQueryKey, data);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(cartQueryKey, data);
      toast.info("Item removed from bag");
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: cartApi.applyCoupon,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(cartQueryKey, data);
      toast.success(data.message || "Coupon applied successfully!");
    },
  });

  /**
   * Resets both Redux and TanStack Query caches synchronously.
   * Prevents resurrecting purchased items upon storefront navigation.
   */
  const clearCart = useCallback(() => {
    dispatch(clearCartState());
    queryClient.setQueryData(cartQueryKey, EMPTY_CART_RESPONSE);
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
  }, [dispatch, queryClient, cartQueryKey]);

  return {
    cartId: cartId || cartQueryData?.cart?._id || null,
    items,
    itemCount,
    totals,
    appliedCoupon,
    isCartDrawerOpen,
    displayTotal,
    isCartLoading: !isInitialized || isCartLoading || isCartFetching,
    openCart: () => dispatch(openCartDrawer()),
    closeCart: () => dispatch(closeCartDrawer()),
    toggleCart: () => dispatch(toggleCartDrawer()),
    clearCart,
    addToCart: (variantId, quantity = 1) =>
      addToCartMutation.mutate({ variantId, quantity }),
    updateQuantity: (variantId, quantity) =>
      updateQuantityMutation.mutate({ variantId, quantity }),
    removeFromCart: (variantId) => removeFromCartMutation.mutate(variantId),
    applyCoupon: (code) => applyCouponMutation.mutate(code),
    isUpdatingCart:
      addToCartMutation.isPending ||
      updateQuantityMutation.isPending ||
      removeFromCartMutation.isPending ||
      applyCouponMutation.isPending,
  };
}
