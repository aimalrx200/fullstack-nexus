import React from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  RotateCcw,
  XCircle,
} from "lucide-react";

export function OrderTimeline({ status = "confirmed", timeline = [] }) {
  const STATUS_STEPS = [
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "processing", label: "Processing & Packed", icon: Package },
    { key: "dispatched", label: "Dispatched & On Route", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const getStatusIndex = (st) => {
    if (st === "delivered") return 3;
    if (st === "dispatched") return 2;
    if (st === "processing") return 1;
    return 0; // confirmed / unfulfilled
  };

  const currentIndex = getStatusIndex(status);

  if (status === "cancelled" || status === "returned") {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 font-mono">
        {status === "cancelled" ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        <span>This order was {status.toUpperCase()}.</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
        Fulfillment Progress
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_STEPS.map((s, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = s.icon;

          return (
            <div
              key={s.key}
              className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-colors ${
                isCurrent
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-xs"
                  : isDone
                    ? "bg-surface-elevated border-border-subtle text-emerald-400"
                    : "bg-surface-app border-border-subtle text-text-faint opacity-50"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isCurrent ? "bg-brand-primary text-white" : "bg-surface-card"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-text-main">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Itemized Audit Log / Timeline Notes */}
      {timeline.length > 0 && (
        <div className="pt-3 border-t border-border-subtle space-y-2">
          <span className="text-[10px] font-mono text-text-faint block uppercase">
            Activity History
          </span>
          <div className="space-y-1.5 text-xs text-text-muted">
            {timeline.map((entry, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-text-main font-medium">
                  {entry.status}
                </span>
                <span className="font-mono text-[10px] text-text-faint">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
