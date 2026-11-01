// apps/nexus-ats/frontend/src/routes/RootLayout.jsx

import { useEffect } from "react";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { selectThemeMode } from "@/redux/slices/themeSlice";
import {
  hydrateAuthSession,
  initializeCrossTabSync,
} from "@/lib/auth/sessionManager";
import TopProgressBar from "@/components/common/TopProgressBar";

export default function RootLayout() {
  const dispatch = useDispatch();
  const theme = useSelector(selectThemeMode);

  useEffect(() => {
    // 1. Check existing session and update Redux auth state
    hydrateAuthSession(dispatch);

    // 2. Subscribe to cross-tab login/logout broadcasts
    const unsubscribe = initializeCrossTabSync(dispatch);

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <TopProgressBar />
      <Toaster
        position="top-right"
        theme={theme}
        richColors
        closeButton
        duration={3500}
      />
      <Outlet />
    </>
  );
}
