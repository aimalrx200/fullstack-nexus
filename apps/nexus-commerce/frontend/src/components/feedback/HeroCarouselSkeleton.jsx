// apps/nexus-commerce/frontend/src/components/feedback/HeroCarouselSkeleton.jsx

import React from "react";

/**
 * Pure presentational Hero Carousel Skeleton loader.
 * Uses animations.css (.shimmer-wave) for shimmering effects.
 * Delay and duration timing are controlled by the parent component (HomePage).
 */
export function HeroCarouselSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading featured products hero showcase"
      className="shimmer-wave relative w-full overflow-hidden rounded-3xl border border-border-main bg-surface-card shadow-2xl mb-10 min-h-125 lg:min-h-115 flex items-center p-6 sm:p-10 lg:p-12 animate-pulse"
    >
      {/* Ambient background depth */}
      <div className="absolute inset-0 bg-radial from-brand-primary/5 via-transparent to-surface-card pointer-events-none" />

      {/* Split-Stage Grid Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text & CTA Placeholders */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4 order-2 lg:order-1">
          {/* Category & Price Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-36 bg-surface-elevated/80 rounded-full border border-border-subtle" />
            <div className="h-6 w-24 bg-emerald-500/10 rounded-full border border-emerald-500/20" />
            <div className="h-6 w-28 bg-indigo-500/10 rounded-full border border-indigo-500/20" />
          </div>

          {/* Title Lines */}
          <div className="space-y-2.5 pt-1">
            <div className="h-8 sm:h-10 lg:h-12 w-11/12 bg-surface-elevated/90 rounded-xl" />
            <div className="h-8 sm:h-10 lg:h-12 w-3/4 bg-surface-elevated/90 rounded-xl" />
          </div>

          {/* Subtitle / Description Lines */}
          <div className="space-y-2 pt-1 max-w-lg">
            <div className="h-4 w-full bg-surface-elevated/50 rounded-md" />
            <div className="h-4 w-4/5 bg-surface-elevated/50 rounded-md" />
          </div>

          {/* Action Buttons & Security Badge */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <div className="h-11 w-38 bg-brand-primary/20 rounded-xl border border-brand-primary/30" />
            <div className="h-11 w-44 bg-surface-elevated/80 rounded-xl border border-border-subtle" />
            <div className="h-9 w-36 bg-surface-elevated/60 rounded-xl border border-border-subtle" />
          </div>
        </div>

        {/* Right Column: Visual Stage Placeholder */}
        <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl bg-surface-elevated/60 border border-border-main p-4 sm:p-6 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-3/4 h-3/4 bg-surface-elevated/80 rounded-2xl border border-border-subtle/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-card/60 border border-border-subtle/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        <div className="h-2 w-7 bg-brand-primary/60 rounded-full" />
        <div className="h-2 w-2 bg-surface-elevated/80 rounded-full border border-border-subtle" />
        <div className="h-2 w-2 bg-surface-elevated/80 rounded-full border border-border-subtle" />
      </div>
    </div>
  );
}

export default HeroCarouselSkeleton;
