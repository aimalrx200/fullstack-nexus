// apps/nexus-ats/frontend/src/redux/slices/themeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "nexus_theme";

// Read synchronously what index.html already stamped on <html>
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return document.documentElement.getAttribute("data-theme") || "dark";
  } catch {
    return "dark";
  }
};

const initialTheme = getInitialTheme();

// Ensure the DOM attribute matches the initial state
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", initialTheme);
}

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: initialTheme, // 'dark' | 'light'
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.mode === "dark" ? "light" : "dark";
      state.mode = nextTheme;
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
      } catch (err) {
        console.error("Failed to persist theme:", err);
      }
    },
    setTheme: (state, action) => {
      const theme = action.payload;
      if (theme !== "dark" && theme !== "light") return;
      state.mode = theme;
      try {
        localStorage.setItem(STORAGE_KEY, theme);
        document.documentElement.setAttribute("data-theme", theme);
      } catch (err) {
        console.error("Failed to persist theme:", err);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = (state) => state.theme.mode;

export default themeSlice.reducer;
