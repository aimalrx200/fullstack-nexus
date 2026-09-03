// src/routes/RootLayout.jsx

import { useEffect } from "react";
import { useNavigation, useOutlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { syncSystemTheme } from "../redux/slices/themeSlice";
import { ProgressBar } from "../components/progress-bars/ProgressBar";

export const RootLayout = () => {
  const navigation = useNavigation();
  const outlet = useOutlet();

  const dispatch = useDispatch();
  const preference = useSelector((state) => state.theme.preference);

  const isRouterLoading = navigation.state === "loading";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (preference === "system") {
        dispatch(syncSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference, dispatch]);

  return (
    <div className="root-layout-container">
      {/* Background & HUD Overlays */}
      <div className="root-layout-grid-overlay" aria-hidden="true" />
      <div className="root-layout-scanline-overlay" aria-hidden="true" />
      <div className="root-layout-hud-frame" aria-hidden="true" />

      {/* Navigation Progress Bar */}
      <ProgressBar isRouterLoading={isRouterLoading} />

      {/* Main Scrollable Viewport */}
      <main className="root-layout-main">{outlet}</main>
    </div>
  );
};
