// apps/nexus-commerce/frontend/src/components/feedback/ProductCardSkeleton.jsx

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-card border border-border-main p-4 overflow-hidden flex flex-col space-y-3 shimmer-wave select-none pointer-events-none animate-in fade-in duration-200">
      {/* Thumbnail Aspect Box */}
      <div className="w-full aspect-square rounded-xl bg-surface-elevated/70" />

      {/* Category Pill */}
      <div className="w-16 h-3.5 rounded-md bg-surface-elevated/60" />

      {/* Title */}
      <div className="w-4/5 h-4.5 rounded-md bg-surface-elevated/80" />

      {/* Price & Action Row */}
      <div className="pt-2 mt-auto flex items-center justify-between">
        <div className="w-20 h-5 rounded-md bg-surface-elevated/70" />
        <div className="w-24 h-9 rounded-xl bg-surface-elevated/60" />
      </div>
    </div>
  );
}
