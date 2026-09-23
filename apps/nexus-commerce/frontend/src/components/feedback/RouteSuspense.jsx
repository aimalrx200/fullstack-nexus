// apps/nexus-commerce/frontend/src/components/feedback/RouteSuspense.jsx

export function RouteSuspense() {
  return (
    <div
      className="w-full space-y-6 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading page structure"
    >
      {/* Header Bar Skeleton */}
      <div className="space-y-2">
        <div className="w-48 sm:w-64 h-7 rounded-xl bg-surface-elevated animate-pulse" />
        <div className="w-72 sm:w-96 h-4 rounded-lg bg-surface-elevated/70 animate-pulse" />
      </div>

      {/* Hero / Master Grid Skeleton */}
      <div className="w-full h-64 sm:h-96 rounded-3xl bg-surface-card border border-border-main p-6 flex flex-col justify-between overflow-hidden relative shimmer-wave">
        <div className="space-y-3 max-w-md">
          <div className="w-28 h-5 rounded-lg bg-surface-elevated animate-pulse" />
          <div className="w-full h-8 rounded-xl bg-surface-elevated animate-pulse" />
          <div className="w-3/4 h-4 rounded-lg bg-surface-elevated/80 animate-pulse" />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <div className="w-36 h-11 rounded-xl bg-surface-elevated animate-pulse" />
          <div className="w-28 h-11 rounded-xl bg-surface-elevated/60 animate-pulse" />
        </div>
      </div>

      {/* Sub-Grid Layout Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-3"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-elevated animate-pulse" />
            <div className="w-24 h-4 rounded-md bg-surface-elevated animate-pulse" />
            <div className="w-16 h-6 rounded-lg bg-surface-elevated/80 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
