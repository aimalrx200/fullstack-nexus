// apps/nexus-commerce/frontend/src/components/feedback/OrderCardSkeleton.jsx

import React from "react";

export function OrderCardSkeleton({
  count = 2,
  showActions = false,
  className = "",
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}
      aria-busy="true"
      aria-label="Loading order cards"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4 shimmer-wave select-none pointer-events-none animate-in fade-in duration-200"
        >
          {/* 1. Header: Order Number & Status Badge */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="space-y-1.5">
              {/* Order Number (e.g. #NEX-123456) */}
              <div className="w-28 h-4 rounded-md bg-surface-elevated/80 animate-pulse" />
              {/* Date Placed */}
              <div className="w-20 h-3 rounded-md bg-surface-elevated/50 animate-pulse" />
            </div>
            {/* Status Pill Badge (e.g. PAID / PENDING) */}
            <div className="w-16 h-5.5 rounded-full bg-surface-elevated/70 animate-pulse" />
          </div>

          {/* 2. Line Items Section (2 Placeholder Items per card) */}
          <div className="space-y-2.5 divide-y divide-border-subtle">
            {Array.from({ length: 2 }).map((_, itemIdx) => (
              <div
                key={itemIdx}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Item Image Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated/70 shrink-0 border border-border-subtle" />
                  <div className="space-y-1.5 min-w-0">
                    {/* Item Title */}
                    <div
                      className="h-3.5 rounded-md bg-surface-elevated/80 animate-pulse"
                      style={{ width: itemIdx === 0 ? "130px" : "100px" }}
                    />
                    {/* Item Qty & SKU */}
                    <div className="w-20 h-3 rounded-md bg-surface-elevated/50 animate-pulse" />
                  </div>
                </div>

                {/* Line Item Total Price */}
                <div className="w-14 h-4 rounded-md bg-surface-elevated/70 shrink-0 animate-pulse" />
              </div>
            ))}
          </div>

          {/* 3. Price Breakdown Section */}
          <div className="pt-3 border-t border-border-subtle space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <div className="w-14 h-3 rounded-md bg-surface-elevated/50 animate-pulse" />
              <div className="w-14 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>

            {/* Shipping Fee */}
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 rounded-md bg-surface-elevated/50 animate-pulse" />
              <div className="w-12 h-3 rounded-md bg-surface-elevated/60 animate-pulse" />
            </div>

            {/* Total Row */}
            <div className="pt-2 border-t border-border-main flex justify-between items-center">
              <div className="w-10 h-4 rounded-md bg-surface-elevated/80 animate-pulse" />
              <div className="w-18 h-5 rounded-md bg-surface-elevated/90 animate-pulse" />
            </div>
          </div>

          {/* 4. Optional FSM / Action Button Bar (Used in Admin Fulfillment) */}
          {showActions && (
            <div className="pt-3 border-t border-border-subtle flex gap-2">
              <div className="w-28 h-9 rounded-xl bg-surface-elevated/70 animate-pulse" />
              <div className="w-32 h-9 rounded-xl bg-surface-elevated/50 animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
