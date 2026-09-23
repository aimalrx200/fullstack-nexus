// apps/nexus-commerce/frontend/src/components/feedback/DashboardSkeleton.jsx

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metrics Overview 4-Card Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface-card border border-border-main flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="w-28 h-3.5 rounded-md bg-surface-elevated animate-pulse" />
              <div className="w-24 h-7 rounded-xl bg-surface-elevated animate-pulse" />
              <div className="w-32 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>
            <div className="w-11 h-11 rounded-2xl bg-surface-elevated animate-pulse shrink-0" />
          </div>
        ))}
      </div>

      {/* Middle Stream & Orders Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="w-36 h-5 rounded-lg bg-surface-elevated animate-pulse" />
            <div className="w-16 h-5 rounded-md bg-surface-elevated/60 animate-pulse" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border-subtle flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="w-24 h-4 rounded-md bg-surface-card animate-pulse" />
                  <div className="w-32 h-3 rounded-md bg-surface-card/60 animate-pulse" />
                </div>
                <div className="w-16 h-5 rounded-md bg-surface-card animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="w-36 h-5 rounded-lg bg-surface-elevated animate-pulse" />
            <div className="w-16 h-4 rounded-md bg-surface-elevated/60 animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="w-28 h-4 rounded-md bg-surface-elevated animate-pulse" />
                  <div className="w-40 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
                </div>
                <div className="w-14 h-5 rounded-md bg-surface-elevated animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-44 h-5 rounded-lg bg-surface-elevated animate-pulse" />
            <div className="w-24 h-4 rounded-md bg-surface-elevated/60 animate-pulse" />
          </div>
          <div className="w-full h-64 rounded-xl bg-surface-elevated/40 animate-pulse" />
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
          <div className="w-44 h-5 rounded-lg bg-surface-elevated animate-pulse" />
          <div className="w-full h-64 rounded-xl bg-surface-elevated/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
