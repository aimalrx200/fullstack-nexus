import React from "react";
import { DollarSign, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function MetricsOverview({ metrics = {} }) {
  const { formatPrice } = useCurrency();

  const cards = [
    {
      label: "Total Revenue (GMV)",
      value: formatPrice(metrics.gmvUSD || 0, metrics.gmvPKR || 0),
      subtitle: `AOV: ${formatPrice(metrics.aovUSD || 0, metrics.aovPKR || 0)}`,
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Total Orders Placed",
      value: (metrics.totalOrders || 0).toLocaleString(),
      subtitle: "Processed in real time",
      icon: ShoppingCart,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Registered Customers",
      value: (metrics.totalCustomers || 0).toLocaleString(),
      subtitle: "Verified VIP Shoppers",
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Low Stock Items",
      value: (metrics.lowStockCount || 0).toLocaleString(),
      subtitle: "Inventory threshold alerts",
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-surface-card border border-border-main shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">
                {card.label}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-text-main">
                {card.value}
              </h3>
              <p className="text-[11px] font-mono text-text-faint">
                {card.subtitle}
              </p>
            </div>

            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
