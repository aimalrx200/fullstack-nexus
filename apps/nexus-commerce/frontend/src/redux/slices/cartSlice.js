// apps/nexus-commerce/frontend/src/redux/slices/cartSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartId: null,
  items: [],
  appliedCoupon: null,
  totals: {
    subtotalUSD: 0,
    subtotalPKR: 0,
    discountUSD: 0,
    discountPKR: 0,
    totalUSD: 0,
    totalPKR: 0,
    itemCount: 0,
  },
  isDrawerOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartState: (state, action) => {
      const { cart, totals } = action.payload || {};
      state.cartId = cart?._id || state.cartId || null;
      state.items = cart?.items || [];
      state.appliedCoupon = cart?.appliedCoupon || null;
      if (totals) state.totals = totals;
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    clearCartState: (state) => {
      state.cartId = null;
      state.items = [];
      state.appliedCoupon = null;
      state.totals = initialState.totals;
    },
  },
});

export const {
  setCartState,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  clearCartState,
} = cartSlice.actions;
export default cartSlice.reducer;
