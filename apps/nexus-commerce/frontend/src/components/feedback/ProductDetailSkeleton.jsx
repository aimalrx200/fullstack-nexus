// apps/nexus-commerce/frontend/src/components/feedback/ProductDetailSkeleton.jsx

import React from "react";

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in fade-in duration-200 select-none pointer-events-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Gallery Skeleton */}
        <div className="space-y-3">
          <div className="w-full aspect-square rounded-3xl bg-surface-card border border-border-main overflow-hidden relative shimmer-wave" />
          <div className="flex gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl bg-surface-card border border-border-subtle shrink-0 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Buy Box Skeleton */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4.5 rounded-lg bg-surface-elevated animate-pulse" />
              <div className="w-20 h-4.5 rounded-lg bg-surface-elevated/60 animate-pulse" />
            </div>

            <div className="w-4/5 h-7.5 rounded-xl bg-surface-elevated animate-pulse" />

            <div className="flex items-center gap-2">
              <div className="w-24 h-3.5 rounded-md bg-surface-elevated animate-pulse" />
              <div className="w-12 h-3.5 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>

            <div className="w-32 h-8.5 rounded-xl bg-surface-elevated animate-pulse pt-2" />
          </div>

          <div className="space-y-2">
            <div className="w-full h-3.5 rounded-md bg-surface-elevated/70 animate-pulse" />
            <div className="w-5/6 h-3.5 rounded-md bg-surface-elevated/70 animate-pulse" />
            <div className="w-4/6 h-3.5 rounded-md bg-surface-elevated/70 animate-pulse" />
          </div>

          {/* Variant Selector Chips Skeleton */}
          <div className="space-y-2">
            <div className="w-28 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            <div className="flex gap-2">
              <div className="w-24 h-8.5 rounded-xl bg-surface-elevated animate-pulse" />
              <div className="w-24 h-8.5 rounded-xl bg-surface-elevated animate-pulse" />
              <div className="w-24 h-8.5 rounded-xl bg-surface-elevated animate-pulse" />
            </div>
          </div>

          {/* Add to Bag CTA Button Skeleton */}
          <div className="pt-2 space-y-3">
            <div className="w-full h-12 rounded-xl bg-surface-elevated animate-pulse" />

            {/* Guarantees Box Skeleton */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle grid grid-cols-3 gap-2">
              <div className="h-9 rounded-lg bg-surface-card/60 animate-pulse" />
              <div className="h-9 rounded-lg bg-surface-card/60 animate-pulse" />
              <div className="h-9 rounded-lg bg-surface-card/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
