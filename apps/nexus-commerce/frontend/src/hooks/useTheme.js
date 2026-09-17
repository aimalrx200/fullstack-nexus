import { useSelector, useDispatch } from "react-redux";
import { setTheme, toggleTheme } from "../redux/slices/themeSlice";
import { THEMES } from "../config/constants";

export function useTheme() {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.currentTheme);

  const isDark =
    currentTheme === THEMES.DARK ||
    (currentTheme === THEMES.SYSTEM &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    theme: currentTheme,
    isDark,
    setTheme: (theme) => dispatch(setTheme(theme)),
    toggleTheme: () => dispatch(toggleTheme()),
    THEMES,
  };
}
