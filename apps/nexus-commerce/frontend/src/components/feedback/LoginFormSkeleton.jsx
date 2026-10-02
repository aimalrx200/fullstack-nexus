// apps/nexus-commerce/frontend/src/components/feedback/LoginFormSkeleton.jsx

import React from "react";

/**
 * Presentational Skeleton loader for LoginForm.
 * Leverages animations.css (.shimmer-wave) to prevent layout shifts/flashes
 * while lazy-loading route chunks or waiting for auth state resolution.
 */
export function LoginFormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading sign-in form"
      className="shimmer-wave space-y-5 animate-pulse"
    >
      {/* 1. Demo Evaluator Bar Placeholder */}
      <div className="h-10 w-full bg-surface-elevated/80 rounded-xl border border-border-subtle" />

      {/* 2. Auth Mode Toggle Pill Placeholder (Password vs Passkey) */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-elevated border border-border-main">
        <div className="h-9 rounded-lg bg-surface-card/80 border border-border-subtle" />
        <div className="h-9 rounded-lg bg-transparent" />
      </div>

      {/* 3. Form Input Placeholders */}
      <div className="space-y-3.5">
        {/* Email Address Placeholder */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 bg-surface-elevated/70 rounded-md" />
          <div className="h-11 w-full bg-surface-elevated/90 rounded-xl border border-border-subtle" />
        </div>

        {/* Password Placeholder */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-16 bg-surface-elevated/70 rounded-md" />
            <div className="h-3 w-24 bg-brand-primary/20 rounded-md" />
          </div>
          <div className="h-11 w-full bg-surface-elevated/90 rounded-xl border border-border-subtle" />
        </div>

        {/* Primary Action Button Placeholder */}
        <div className="h-11 w-full bg-brand-primary/20 rounded-xl border border-brand-primary/30 mt-2" />
      </div>

      {/* 4. Divider Placeholder */}
      <div className="relative flex items-center justify-center my-3">
        <div className="w-full border-t border-border-subtle" />
        <div className="absolute px-3 bg-surface-card text-[11px]">
          <div className="h-3 w-28 bg-surface-elevated/60 rounded-md" />
        </div>
      </div>

      {/* 5. Google OAuth Provider Button Placeholder */}
      <div className="h-11 w-full bg-surface-elevated/80 rounded-xl border border-border-subtle" />

      {/* 6. Switch to Register Link Placeholder */}
      <div className="flex justify-center items-center pt-1">
        <div className="h-3.5 w-48 bg-surface-elevated/60 rounded-md" />
      </div>
    </div>
  );
}

export default LoginFormSkeleton;
