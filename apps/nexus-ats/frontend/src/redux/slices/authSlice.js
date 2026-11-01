// apps/nexus-ats/frontend/src/redux/slices/authSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { APP_CONFIG } from "@/config/constants";

export const AUTH_STATUS = {
  IDLE: "idle",
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

export const DEFAULT_DEMO_RECRUITER = {
  id: "rec_demo_01",
  name: APP_CONFIG.demoRecruiter.name,
  email: APP_CONFIG.demoRecruiter.email,
  role: APP_CONFIG.demoRecruiter.role,
  department: "Talent Acquisition",
  avatar: APP_CONFIG.demoRecruiter.avatar,
};

const initialState = {
  user: null,
  status: AUTH_STATUS.INITIALIZING,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthInitializing: (state) => {
      state.status = AUTH_STATUS.INITIALIZING;
      state.error = null;
    },
    setAuthenticatedUser: (state, action) => {
      state.user = action.payload;
      state.status = AUTH_STATUS.AUTHENTICATED;
      state.error = null;
    },
    setUnauthenticated: (state) => {
      state.user = null;
      state.status = AUTH_STATUS.UNAUTHENTICATED;
      state.error = null;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.status = AUTH_STATUS.UNAUTHENTICATED;
    },
  },
});

export const {
  setAuthInitializing,
  setAuthenticatedUser,
  setUnauthenticated,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
