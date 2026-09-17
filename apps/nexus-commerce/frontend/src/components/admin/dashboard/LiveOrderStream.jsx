import React from "react";
import { format } from "date-fns";
import { Bell, BellOff, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useAdminOrderStream } from "../../../hooks/useAdminOrderStream";
import { useCurrency } from "../../../hooks/useCurrency";
import { Badge } from "../../common/Badge";

export function LiveOrderStream() {
  const {
    liveOrders,
    soundAlertsEnabled,
    isConnected,
    toggleSound,
    clearStream,
  } = useAdminOrderStream();

  const { formatPrice } = useCurrency();

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text-main flex items-center gap-2">
              <span>Live Inbound Order Radar</span>
              <Badge
                variant={isConnected ? "success" : "warning"}
                size="sm"
                pulse
              >
                {isConnected ? "LIVE STREAM" : "CONNECTING"}
              </Badge>
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              Auto-updating via SSE & Redis Pub/Sub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`min-h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundAlertsEnabled
                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                : "bg-surface-elevated border-border-main text-text-muted hover:text-text-main"
            }`}
            title={soundAlertsEnabled ? "Mute Chimes" : "Enable Chimes"}
          >
            {soundAlertsEnabled ? (
              <Bell className="w-3.5 h-3.5" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {soundAlertsEnabled ? "Chimes Active" : "Muted"}
            </span>
          </button>

          {/* Clear Feed */}
          {liveOrders.length > 0 && (
            <button
              type="button"
              onClick={clearStream}
              className="min-h-9 px-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-faint hover:text-text-main border border-border-subtle transition-colors cursor-pointer"
              title="Clear feed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Order Card Feed */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar">
        {liveOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-text-faint stroke-[1.5]" />
            <p className="font-mono">
              Listening for inbound customer checkout orders...
            </p>
          </div>
        ) : (
          liveOrders.map((order, idx) => (
            <div
              key={order.orderId || idx}
              className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle hover:border-brand-primary/30 transition-all flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-text-main">
                    #{order.orderNumber}
                  </span>
                  <span className="text-[10px] font-mono text-text-faint">
                    {order.createdAt
                      ? format(new Date(order.createdAt), "HH:mm:ss")
                      : "Just now"}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate">
                  {order.customerName} • {order.city || "Domestic"}
                </p>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <span className="font-mono font-bold text-xs text-brand-primary block">
                  {formatPrice(order.total, order.total)}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-surface-card border border-border-subtle uppercase text-text-muted">
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
