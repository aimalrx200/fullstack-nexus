import React from "react";
import { format } from "date-fns";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";
import { Badge } from "../../common/Badge";

export function RecentOrdersCard({ orders = [] }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="p-5 rounded-3xl bg-surface-card border border-border-main space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-text-main">
              Recent Customer Orders
            </h3>
            <p className="text-[11px] text-text-muted font-mono">
              Latest transactions across all gateways
            </p>
          </div>
        </div>

        <a
          href="/admin/orders"
          className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border-subtle">
        {orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted font-mono">
            No recent orders placed yet.
          </div>
        ) : (
          orders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-main">
                    #{order.orderNumber}
                  </span>
                  <span className="text-[10px] font-mono text-text-faint">
                    {order.createdAt
                      ? format(new Date(order.createdAt), "MMM dd, HH:mm")
                      : ""}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">
                  {order.shippingAddress?.recipientName || order.customerEmail}
                </p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="font-mono font-bold text-text-main block">
                  {formatPrice(order.pricing?.total, order.pricing?.total)}
                </span>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "success" : "warning"
                  }
                  size="sm"
                >
                  {order.paymentStatus?.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
