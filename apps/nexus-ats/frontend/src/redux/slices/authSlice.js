// apps/nexus-ats/frontend/src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/authApi";
import { saveSession, removeSession } from "@/lib/auth/sessionManager";

export const AUTH_STATUS = {
  IDLE: "idle",
  INITIALIZING: "initializing",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
};

/**
 * 1-Click Demo Recruiter Login (Alex Sterling)
 */
export const demoLoginUser = createAsyncThunk(
  "auth/demoLoginUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.demoLogin();
      saveSession(data.user);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || "Demo sign in failed");
    }
  },
);

/**
 * Standard Email & Password Login
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      saveSession(data.user);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || "Invalid email or password");
    }
  },
);

/**
 * Check active session against live backend (/api/v1/auth/me)
 */
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      if (data.user) {
        saveSession(data.user);
        return data.user;
      }
      removeSession("expired");
      return rejectWithValue("No active session");
    } catch (err) {
      removeSession("expired");
      return rejectWithValue(err.message || "Session expired");
    }
  },
);

/**
 * Terminate Session & Clear Cookie
 */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      removeSession("manual");
      return true;
    } catch (err) {
      removeSession("manual");
      return rejectWithValue(err.message || "Logout failed");
    }
  },
);

const initialState = {
  user: null,
  status: AUTH_STATUS.INITIALIZING,
  loading: false,
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
  extraReducers: (builder) => {
    builder
      // Check session
      .addCase(checkAuthSession.pending, (state) => {
        state.status = AUTH_STATUS.INITIALIZING;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = AUTH_STATUS.AUTHENTICATED;
        state.error = null;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.user = null;
        state.status = AUTH_STATUS.UNAUTHENTICATED;
      })

      // Demo Login
      .addCase(demoLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(demoLoginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = AUTH_STATUS.AUTHENTICATED;
        state.loading = false;
        state.error = null;
      })
      .addCase(demoLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.status = AUTH_STATUS.UNAUTHENTICATED;
      })

      // Standard Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = AUTH_STATUS.AUTHENTICATED;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.status = AUTH_STATUS.UNAUTHENTICATED;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = AUTH_STATUS.UNAUTHENTICATED;
        state.error = null;
      });
  },
});

export const {
  setAuthInitializing,
  setAuthenticatedUser,
  setUnauthenticated,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
