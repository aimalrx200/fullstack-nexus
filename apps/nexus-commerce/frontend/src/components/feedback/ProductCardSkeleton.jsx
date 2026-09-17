import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-card border border-border-main p-4 overflow-hidden flex flex-col space-y-3 shimmer-wave">
      {/* Thumbnail Aspect Box */}
      <div className="w-full aspect-square rounded-xl bg-surface-elevated" />

      {/* Category Pill */}
      <div className="w-16 h-4 rounded-md bg-surface-elevated" />

      {/* Title */}
      <div className="w-4/5 h-5 rounded-md bg-surface-elevated" />

      {/* Price & Action Row */}
      <div className="pt-2 mt-auto flex items-center justify-between">
        <div className="w-20 h-6 rounded-md bg-surface-elevated" />
        <div className="w-24 h-10 rounded-xl bg-surface-elevated" />
      </div>
    </div>
  );
}
