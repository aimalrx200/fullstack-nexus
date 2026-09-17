import React, { useState } from "react";
import { Tag, CheckCircle2, Loader2, X } from "lucide-react";
import { useCart } from "../../../hooks/useCart";

export function CouponInputBox() {
  const { appliedCoupon, applyCoupon, isUpdatingCart } = useCart();
  const [code, setCode] = useState("");

  const handleApply = (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    applyCoupon(code.trim().toUpperCase());
    setCode("");
  };

  return (
    <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-main space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-brand-primary" />
          <span>Promotional Code</span>
        </label>
        {appliedCoupon && (
          <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Applied: {appliedCoupon.code}
          </span>
        )}
      </div>

      {appliedCoupon ? (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-mono font-bold text-emerald-400">
              {appliedCoupon.code}
            </span>
            <span className="text-text-muted text-[11px] ml-1.5">
              ({appliedCoupon.discountPercent}% Discount)
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. NEXUS20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-xs font-mono uppercase text-text-main focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!code.trim() || isUpdatingCart}
            className="min-h-10 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdatingCart ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
