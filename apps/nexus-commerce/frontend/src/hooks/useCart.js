import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useCart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const totals = useSelector(selectCartTotals);
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const isCartDrawerOpen = useSelector(selectIsCartDrawerOpen);
  const displayTotal = useSelector(selectActiveCartDisplayTotal);

  // Sync Cart with Backend
  const { isLoading: isCartLoading } = useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: async () => {
      const data = await cartApi.getCart();
      dispatch(setCartState(data));
      return data;
    },
    staleTime: 0, // Real-time
  });

  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(queryKeys.cart.current(), data);
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
      queryClient.setQueryData(queryKeys.cart.current(), data);
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(queryKeys.cart.current(), data);
      toast.info("Item removed from bag");
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: cartApi.applyCoupon,
    onSuccess: (data) => {
      dispatch(setCartState(data));
      queryClient.setQueryData(queryKeys.cart.current(), data);
      toast.success(data.message || "Coupon applied successfully!");
    },
  });

  return {
    items,
    itemCount,
    totals,
    appliedCoupon,
    isCartDrawerOpen,
    displayTotal,
    isCartLoading,
    openCart: () => dispatch(openCartDrawer()),
    closeCart: () => dispatch(closeCartDrawer()),
    toggleCart: () => dispatch(toggleCartDrawer()),
    clearCart: () => dispatch(clearCartState()),
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
