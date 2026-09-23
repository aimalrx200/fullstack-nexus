// apps/nexus-commerce/frontend/src/layouts/AuthLayout.jsx

import React from "react";
import { Outlet, useLocation } from "react-router";
import { Sparkles } from "lucide-react";
import { PageTransition } from "../components/common/PageTransition";

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-surface-app text-text-main relative selection:bg-brand-primary selection:text-white">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Logo Header */}
        <div className="text-center space-y-1.5">
          <a
            href="/"
            className="inline-flex items-center gap-2 select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1 text-xl font-extrabold tracking-tight">
              <span>NEXUS</span>
              <span className="text-brand-primary text-xs font-mono font-semibold">
                COMMERCE
              </span>
            </div>
          </a>
        </div>

        {/* Immediate Paint Container Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-main shadow-2xl backdrop-blur-md">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>

        <p className="text-center text-xs text-text-faint font-mono">
          © 2026 FullStack Nexus. Enterprise Systems Monorepo.
        </p>
      </div>
    </div>
  );
}
