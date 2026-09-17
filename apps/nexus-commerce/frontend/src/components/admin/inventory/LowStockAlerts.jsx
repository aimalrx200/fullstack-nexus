import React from "react";
import { AlertTriangle, Edit } from "lucide-react";
import { Badge } from "../../common/Badge";

export function LowStockAlerts({ items = [], onOverrideClick }) {
  if (items.length === 0) {
    return (
      <div className="p-5 rounded-3xl bg-surface-card border border-border-main flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-main">
            Inventory Healthy
          </h4>
          <p className="text-[11px] text-text-muted">
            All warehouse SKU quantities are above depletion thresholds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-surface-card border border-border-main space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text-main">
              Low Stock Depletion Warnings
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              {items.length} SKUs below threshold
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar divide-y divide-border-subtle">
        {items.map((item) => (
          <div
            key={item._id}
            className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="font-mono font-bold text-text-main block">
                {item.sku}
              </span>
              <p className="text-[11px] text-text-muted truncate">
                {item.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="warning" size="sm" pulse>
                {item.stock} units left
              </Badge>
              {onOverrideClick && (
                <button
                  type="button"
                  onClick={() => onOverrideClick(item)}
                  className="min-h-7.5 px-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>Restock</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
