// apps/nexus-commerce/frontend/src/hooks/useTheme.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTheme,
  toggleTheme,
  applyThemeToDOM,
} from "../redux/slices/themeSlice";
import { THEMES } from "../config/constants";

export function useTheme() {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.currentTheme);

  // Sync DOM on mount and attach OS listener for SYSTEM mode
  useEffect(() => {
    applyThemeToDOM(currentTheme);

    if (currentTheme === THEMES.SYSTEM && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => {
        applyThemeToDOM(THEMES.SYSTEM);
      };

      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [currentTheme]);

  const isDark =
    currentTheme === THEMES.DARK ||
    (currentTheme === THEMES.SYSTEM &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    theme: currentTheme,
    isDark,
    setTheme: (t) => dispatch(setTheme(t)),
    toggleTheme: () => dispatch(toggleTheme()),
    THEMES,
  };
}
