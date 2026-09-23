// apps/nexus-commerce/frontend/src/components/feedback/OrderCardSkeleton.jsx

import React from "react";

export function OrderCardSkeleton({ count = 2 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="space-y-1">
              <div className="w-28 h-4 rounded-md bg-surface-elevated animate-pulse" />
              <div className="w-20 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>
            <div className="w-16 h-5 rounded-full bg-surface-elevated animate-pulse" />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, itemIdx) => (
              <div
                key={itemIdx}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated animate-pulse shrink-0" />
                  <div className="space-y-1">
                    <div className="w-32 h-3.5 rounded-md bg-surface-elevated animate-pulse" />
                    <div className="w-20 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
                  </div>
                </div>
                <div className="w-14 h-4 rounded-md bg-surface-elevated animate-pulse" />
              </div>
            ))}
          </div>

          {/* Breakdown Rows */}
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <div className="flex justify-between">
              <div className="w-16 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
              <div className="w-14 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>
            <div className="flex justify-between pt-1 border-t border-border-main">
              <div className="w-12 h-4 rounded-md bg-surface-elevated animate-pulse" />
              <div className="w-16 h-5 rounded-md bg-surface-elevated animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
