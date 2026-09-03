// src/layouts/DashboardContent.jsx

import { useLocation, useOutlet } from "react-router";
import { AnimatePresence } from "framer-motion";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { AnimatedPage } from "../components/animations/AnimatedPage";

export function DashboardContent() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <main className="dashboard-content-main">
      <div className="dashboard-content-wrapper">
        <Breadcrumbs />
        <AnimatePresence mode="wait" initial={false}>
          {outlet && (
            <AnimatedPage key={location.pathname}>{outlet}</AnimatedPage>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
