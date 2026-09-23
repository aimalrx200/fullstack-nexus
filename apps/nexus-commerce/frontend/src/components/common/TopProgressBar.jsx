// apps/nexus-commerce/frontend/src/components/common/TopProgressBar.jsx

import React from "react";
import { useSelector } from "react-redux";

/**
 * Pure Redux-Driven Top Progress Bar
 * Connected directly to `state.ui.loading`. Zero local state, zero duplicate mounts.
 */
export function TopProgressBar() {
  const { progress, isVisible } = useSelector((state) => state.ui.loading);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-100 pointer-events-none overflow-hidden bg-transparent transition-opacity duration-300 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="relative h-full bg-linear-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
        style={{
          width: `${progress}%`,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Leading-edge laser pulse glow */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-r from-transparent via-white/40 to-white shadow-[0_0_14px_rgba(99,102,241,1),0_0_6px_rgba(56,189,248,0.9)]" />
      </div>
    </div>
  );
}
