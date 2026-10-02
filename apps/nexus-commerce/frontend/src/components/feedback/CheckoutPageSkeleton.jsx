// apps/nexus-commerce/frontend/src/components/feedback/CheckoutPageSkeleton.jsx

export function CheckoutPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Stepper Skeleton */}
      <div className="h-12 bg-surface-card rounded-2xl border border-border-subtle w-full" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface-card border border-border-main space-y-5">
          <div className="h-5 bg-surface-elevated rounded-md w-1/3" />

          {/* Recipient Name Input */}
          <div className="space-y-2">
            <div className="h-3 bg-surface-elevated rounded-md w-24" />
            <div className="h-11 bg-surface-elevated rounded-xl w-full" />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <div className="h-3 bg-surface-elevated rounded-md w-32" />
            <div className="h-11 bg-surface-elevated rounded-xl w-full" />
          </div>

          {/* Phone Input */}
          <div className="h-11 bg-surface-elevated rounded-xl w-full" />

          {/* Address Autocomplete */}
          <div className="h-11 bg-surface-elevated rounded-xl w-full" />

          {/* Map Area Placeholder */}
          <div className="h-48 bg-surface-elevated rounded-2xl w-full" />

          {/* Action Button */}
          <div className="h-12 bg-surface-elevated rounded-xl w-full" />
        </div>

        {/* Right Column - Cart Summary */}
        <div className="p-6 rounded-3xl bg-surface-card border border-border-main space-y-4 h-fit">
          <div className="h-4 bg-surface-elevated rounded-md w-1/2" />
          <div className="space-y-3 pt-2">
            <div className="h-12 bg-surface-elevated rounded-xl w-full" />
            <div className="h-12 bg-surface-elevated rounded-xl w-full" />
          </div>
          <div className="h-20 bg-surface-elevated rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
