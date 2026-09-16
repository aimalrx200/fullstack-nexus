import { createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS, THEMES } from "../../config/constants";

const getInitialTheme = () => {
  if (typeof window === "undefined") return THEMES.DARK;
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved && Object.values(THEMES).includes(saved)) return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? THEMES.LIGHT
    : THEMES.DARK;
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
