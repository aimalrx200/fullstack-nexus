import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMobileMenuOpen: false,
  activeModal: null, // e.g. 'PASSKEY_PROMPT', 'COUPON_MODAL', 'STOCK_OVERRIDE'
  modalPayload: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload.modalType;
      state.modalPayload = action.payload.data || null;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.modalPayload = null;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, openModal, closeModal } =
  uiSlice.actions;
export default uiSlice.reducer;
