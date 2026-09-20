// apps/nexus-commerce/frontend/src/components/admin/support/CustomerContextSidebar.jsx
import React from "react";
import { ShoppingBag, ShieldCheck, X } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function CustomerContextSidebar({
  conversation,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const { formatPrice } = useCurrency();

  if (!conversation) return null;

  const cart = conversation.cartContextSnapshot || {};

  const content = (
    <div className="p-4 sm:p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
      {/* Drawer Header on Mobile */}
      <div className="flex items-center justify-between xl:hidden border-b border-border-subtle pb-3">
        <h3 className="text-xs font-bold text-text-main">
          Shopper Intelligence
        </h3>
        <button
          type="button"
          onClick={onCloseMobile}
          className="w-8 h-8 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-main"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Customer Profile Card */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
          Shopper Identity
        </span>
        <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm font-mono shrink-0">
            {conversation.customerName ? conversation.customerName[0] : "C"}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-text-main truncate">
              {conversation.customerName || "Guest Shopper"}
            </h4>
            <p className="text-[11px] font-mono text-text-muted truncate">
              {conversation.customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Live Bag Inspection */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5 font-bold">
          <ShoppingBag className="w-3.5 h-3.5 text-brand-primary" />
          <span>Active Cart Inspection</span>
        </span>
        <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2.5 text-xs">
          <div className="flex justify-between text-text-muted">
            <span>Bag Quantity</span>
            <span className="font-mono font-bold text-text-main">
              {cart.itemCount || 0} items
            </span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Calculated Subtotal</span>
            <span className="font-mono font-bold text-brand-primary text-sm">
              {formatPrice(cart.totalUSD || 0, cart.totalPKR || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Status */}
      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="text-[11px] font-medium">
          Real-Time SSE Channel Verified
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Pane (Visible on xl screens ≥ 1280px) */}
      <div className="w-72 xl:w-80 bg-surface-card border-l border-border-main hidden xl:block h-full shrink-0">
        {content}
      </div>

      {/* Mobile Modal Drawer (Slide-over on < 1280px) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-surface-card border-l border-border-main z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
