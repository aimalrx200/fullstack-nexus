// apps/nexus-commerce/frontend/src/redux/slices/uiSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMobileMenuOpen: false,
  activeModal: null,
  modalPayload: null,
  // Continuous Task-Bridged Loading State
  loading: {
    activeRequests: 0,
    progress: 0,
    isVisible: false,
    isTransitioning: false,
  },
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

    // =========================================================================
    // CONTINUOUS TASK BRIDGE & PROGRESS ENGINE
    // =========================================================================

    /**
     * 1. Start Phase: Triggered on Login/Demo/Register click
     */
    startAuthTransition: (state) => {
      state.loading.isTransitioning = true;
      state.loading.isVisible = true;
      state.loading.progress = Math.max(state.loading.progress, 35);
    },

    /**
     * 2. Handoff Phase: Triggered when Auth API succeeds
     * Holds progress at 65% across route navigation instead of closing
     */
    markAuthHandoff: (state) => {
      state.loading.isTransitioning = true;
      state.loading.isVisible = true;
      state.loading.progress = Math.max(state.loading.progress, 65);
    },

    /**
     * 3. Standard Request Tracking
     */
    startLoading: (state) => {
      const wasIdle =
        state.loading.activeRequests === 0 && !state.loading.isVisible;
      state.loading.activeRequests += 1;

      if (wasIdle && !state.loading.isTransitioning) {
        state.loading.progress = 30;
      } else {
        // Monotonically advance as chained queries arrive
        state.loading.progress = Math.max(
          state.loading.progress,
          Math.min(88, state.loading.progress + 12),
        );
      }
      state.loading.isVisible = true;
    },

    stopLoading: (state) => {
      state.loading.activeRequests = Math.max(
        0,
        state.loading.activeRequests - 1,
      );

      if (state.loading.activeRequests > 0) {
        state.loading.progress = Math.max(
          state.loading.progress,
          Math.min(92, state.loading.progress + 10),
        );
        state.loading.isVisible = true;
        return;
      }

      // If transitioning (e.g. login API finished, but route change is in flight):
      // Hold at 65% to bridge into destination queries
      if (state.loading.isTransitioning) {
        state.loading.progress = Math.max(state.loading.progress, 65);
        state.loading.isVisible = true;
        return;
      }

      // When all destination queries complete: sweep to 100%
      state.loading.progress = 100;
    },

    /**
     * 4. Final Single Completion & Cleanup
     */
    finalizeLoading: (state) => {
      if (state.loading.activeRequests === 0) {
        state.loading.isTransitioning = false;
        state.loading.progress = 100;
      }
    },

    hideLoading: (state) => {
      if (state.loading.activeRequests === 0) {
        state.loading.isTransitioning = false;
        state.loading.isVisible = false;
      }
    },

    resetLoading: (state) => {
      if (
        state.loading.activeRequests === 0 &&
        !state.loading.isVisible &&
        !state.loading.isTransitioning
      ) {
        state.loading.progress = 0;
      }
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  openModal,
  closeModal,
  startAuthTransition,
  markAuthHandoff,
  startLoading,
  stopLoading,
  finalizeLoading,
  hideLoading,
  resetLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
