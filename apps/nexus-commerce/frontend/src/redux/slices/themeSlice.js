// apps/nexus-commerce/frontend/src/redux/slices/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS, THEMES } from "../../config/constants";

/**
 * Applies or removes the 'dark' class on <html> based on theme
 */
export const applyThemeToDOM = (theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (theme === THEMES.DARK) {
    root.classList.add("dark");
  } else if (theme === THEMES.LIGHT) {
    root.classList.remove("dark");
  } else {
    // SYSTEM Mode: inspect system OS preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};

const getInitialTheme = () => {
  if (typeof window === "undefined") return THEMES.SYSTEM;
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved && Object.values(THEMES).includes(saved)) {
    return saved;
  }
  return THEMES.SYSTEM;
};

const initialState = {
  currentTheme: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
    },
    toggleTheme: (state) => {
      state.currentTheme =
        state.currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
