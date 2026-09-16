import { createSelector } from "@reduxjs/toolkit";

const selectCart = (state) => state.cart;
const selectCurrencyState = (state) => state.currency;

export const selectCartItems = createSelector(
  [selectCart],
  (cart) => cart.items,
);

export const selectCartItemCount = createSelector(
  [selectCart],
  (cart) => cart.totals.itemCount || 0,
);

export const selectCartTotals = createSelector(
  [selectCart],
  (cart) => cart.totals,
);

export const selectAppliedCoupon = createSelector(
  [selectCart],
  (cart) => cart.appliedCoupon,
);

export const selectIsCartDrawerOpen = createSelector(
  [selectCart],
  (cart) => cart.isDrawerOpen,
);

// Formatted active display total based on selected currency
export const selectActiveCartDisplayTotal = createSelector(
  [selectCartTotals, selectCurrencyState],
  (totals, currency) => {
    const isPKR = currency.activeCurrency === "PKR";
    return {
      currency: currency.activeCurrency,
      symbol: isPKR ? "₨" : "$",
      subtotal: isPKR ? totals.subtotalPKR : totals.subtotalUSD,
      discount: isPKR ? totals.discountPKR : totals.discountUSD,
      total: isPKR ? totals.totalPKR : totals.totalUSD,
    };
  },
);
