import React from "react";
import { User, ShoppingBag, MapPin, ShieldCheck } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function CustomerContextSidebar({ conversation }) {
  const { formatPrice } = useCurrency();

  if (!conversation) return null;

  const cart = conversation.cartContextSnapshot || {};

  return (
    <div className="w-72 bg-surface-card border-l border-border-main p-4 space-y-5 overflow-y-auto custom-scrollbar hidden lg:block">
      {/* Customer Profile Card */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Shopper Profile
        </span>
        <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs font-mono">
            {conversation.customerName ? conversation.customerName[0] : "C"}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-text-main truncate">
              {conversation.customerName || "Guest Shopper"}
            </h4>
            <p className="text-[11px] text-text-muted truncate">
              {conversation.customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Live Cart Snapshot Inspection */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-brand-primary" />
          <span>Active Cart Inspection</span>
        </span>
        <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle space-y-2 text-xs">
          <div className="flex justify-between text-text-muted">
            <span>Bag Items</span>
            <span className="font-mono font-bold text-text-main">
              {cart.itemCount || 0} items
            </span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span className="font-mono font-bold text-brand-primary">
              {formatPrice(cart.totalUSD || 0, cart.totalPKR || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Verification Status */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="text-[11px]">Real-Time SSE Channel Verified</span>
      </div>
    </div>
  );
}
