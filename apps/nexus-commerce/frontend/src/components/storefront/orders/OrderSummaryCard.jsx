import React from "react";
import { useCurrency } from "../../../hooks/useCurrency";
import { PaymentStatusBadge } from "../../admin/orders/PaymentStatusBadge";

export function OrderSummaryCard({ order }) {
  const { formatPrice } = useCurrency();

  if (!order) return null;

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-bold text-text-main font-mono">
            Order #{order.orderNumber}
          </h3>
          <p className="text-[11px] text-text-muted font-mono">
            Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      {/* Item List */}
      <div className="space-y-2.5 divide-y divide-border-subtle">
        {order.items?.map((item, idx) => (
          <div
            key={idx}
            className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80"
                }
                alt={item.title}
                className="w-10 h-10 rounded-lg bg-surface-elevated object-cover shrink-0 border border-border-subtle"
              />
              <div className="min-w-0">
                <p className="font-semibold text-text-main truncate">
                  {item.title}
                </p>
                <p className="text-[11px] font-mono text-text-muted">
                  Qty: {item.quantity} × {item.sku}
                </p>
              </div>
            </div>

            <span className="font-mono font-bold text-text-main shrink-0">
              {formatPrice(item.totalUSD, item.totalPKR)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="pt-3 border-t border-border-subtle space-y-1.5 text-xs text-text-muted">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono text-text-main">
            {formatPrice(order.pricing?.subtotal, order.pricing?.subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-mono text-text-main">
            {formatPrice(
              order.pricing?.shippingFee,
              order.pricing?.shippingFee,
            )}
          </span>
        </div>
        {order.pricing?.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Promotional Discount</span>
            <span className="font-mono">
              -{formatPrice(order.pricing?.discount, order.pricing?.discount)}
            </span>
          </div>
        )}
        <div className="pt-2 border-t border-border-main flex justify-between text-sm font-bold text-text-main">
          <span>Total</span>
          <span className="font-mono text-brand-primary">
            {formatPrice(order.pricing?.total, order.pricing?.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
