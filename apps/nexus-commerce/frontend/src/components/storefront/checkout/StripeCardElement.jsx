// apps/nexus-commerce/frontend/src/components/storefront/checkout/StripeCardElement.jsx

import React from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { Lock, ShieldCheck } from "lucide-react";

export function StripeCardElement({ onChange }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3.5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-text-main">
          Credit or Debit Card
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <Lock className="w-3 h-3" /> PCI-DSS Level 1 Certified
        </span>
      </div>

      {/* Stripe Native Iframe Container */}
      <div className="p-3.5 rounded-xl bg-surface-card border border-border-main text-text-main">
        <CardElement
          onChange={onChange}
          options={{
            hidePostalCode: true, // 👈 Removes redundant second ZIP input
            style: {
              base: {
                fontSize: "13px",
                color: "#f8fafc",
                fontFamily: "Inter, sans-serif",
                "::placeholder": {
                  color: "#64748b",
                },
              },
              invalid: {
                color: "#f43f5e",
              },
            },
          }}
        />
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Stripe 3D-Secure 2.0 Strong Customer Authentication (SCA)</span>
      </div>
    </div>
  );
}
