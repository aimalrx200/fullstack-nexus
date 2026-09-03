// src/redux/slices/themeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const resolveTheme = (preference) => {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyToDOM = (resolvedMode) => {
  if (resolvedMode === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }
};

const savedPreference = localStorage.getItem("theme_preference") || "system";
const initialResolvedMode = resolveTheme(savedPreference);

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    preference: savedPreference,
    resolvedMode: initialResolvedMode,
  },
  reducers: {
    setThemePreference: (state, action) => {
      const newPref = action.payload; // 'system' | 'light' | 'dark'
      state.preference = newPref;
      state.resolvedMode = resolveTheme(newPref);

      localStorage.setItem("theme_preference", newPref);
      applyToDOM(state.resolvedMode);
    },
    syncSystemTheme: (state) => {
      if (state.preference === "system") {
        state.resolvedMode = resolveTheme("system");
        applyToDOM(state.resolvedMode);
      }
    },
  },
});

export const { setThemePreference, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
