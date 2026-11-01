// apps/nexus-ats/frontend/src/redux/slices/uiSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  candidateDrawerOpen: false,
  createJobModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
    openCandidateDrawer: (state) => {
      state.candidateDrawerOpen = true;
    },
    closeCandidateDrawer: (state) => {
      state.candidateDrawerOpen = false;
    },
    setCreateJobModalOpen: (state, action) => {
      state.createJobModalOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  openCandidateDrawer,
  closeCandidateDrawer,
  setCreateJobModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
