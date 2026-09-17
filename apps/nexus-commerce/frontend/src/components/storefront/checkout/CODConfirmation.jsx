import React from "react";
import { Banknote, CheckCircle2, ShieldAlert } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function CODConfirmation({ totalUSD, totalPKR }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3.5 animate-in fade-in">
      <div className="flex items-center gap-2 text-text-main">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Banknote className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-main">
            Cash on Delivery (COD)
          </h4>
          <p className="text-[11px] text-text-muted">
            Pay in cash to courier agent upon physical parcel delivery
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-300 font-medium">
            Collectable Amount:
          </span>
          <span className="font-mono font-bold text-amber-200 text-sm">
            {formatPrice(totalUSD, totalPKR)}
          </span>
        </div>
        <p className="text-[11px] text-amber-300/80 leading-relaxed">
          Please keep the exact cash amount ready for the delivery rider to
          ensure quick dispatch.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Anti-fraud phone validation pre-check passed</span>
      </div>
    </div>
  );
}
