import React from "react";
import { useCart } from "../../../hooks/useCart";
import { useCurrency } from "../../../hooks/useCurrency";

export function CartSummary() {
  const { totals, appliedCoupon } = useCart();
  const { formatPrice } = useCurrency();

  // Clean check for active discounts
  const hasDiscount = totals.discountUSD > 0 || totals.discountPKR > 0;

  return (
    <div className="space-y-2.5 text-xs">
      <div className="flex items-center justify-between text-text-muted">
        <span>Subtotal</span>
        <span className="font-mono font-medium text-text-main">
          {formatPrice(totals.subtotalUSD, totals.subtotalPKR)}
        </span>
      </div>

      {appliedCoupon && hasDiscount && (
        <div className="flex items-center justify-between text-emerald-400">
          <span>Coupon Discount ({appliedCoupon.code})</span>
          <span className="font-mono font-medium">
            -{formatPrice(totals.discountUSD, totals.discountPKR)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-text-muted">
        <span>Estimated Delivery</span>
        <span className="font-mono text-emerald-400 font-semibold">
          Calculated at step 2
        </span>
      </div>

      <div className="pt-2.5 border-t border-border-main flex items-center justify-between text-sm font-bold text-text-main">
        <span>Estimated Total</span>
        <span className="font-mono text-base text-brand-primary">
          {formatPrice(totals.totalUSD, totals.totalPKR)}
        </span>
      </div>
    </div>
  );
}
