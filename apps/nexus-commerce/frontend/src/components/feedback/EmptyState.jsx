import React from "react";
import { PackageOpen } from "lucide-react";
import { Button } from "../common/Button";

export function EmptyState({
  icon: Icon = PackageOpen,
  title = "No items found",
  description = "Try adjusting your filters or search keywords.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`w-full py-16 px-4 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-surface-elevated border border-border-main flex items-center justify-center text-text-muted shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-text-main tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
