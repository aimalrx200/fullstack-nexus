import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isInitialized = true;
    },
    setUserVerified: (state) => {
      if (state.user) {
        state.user.isEmailVerified = true;
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  setCredentials,
  setUserVerified,
  clearCredentials,
  setInitialized,
} = authSlice.actions;
export default authSlice.reducer;
