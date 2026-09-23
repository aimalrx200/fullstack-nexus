// apps/nexus-commerce/frontend/src/pages/storefront/AccountPage.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { orderApi } from "../../lib/api/orderApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { Package } from "lucide-react";
import { OrderSummaryCard } from "../../components/storefront/orders/OrderSummaryCard";
import { OrderCardSkeleton } from "../../components/feedback/OrderCardSkeleton";
import { Badge } from "../../components/common/Badge";

export function AccountPage() {
  const { user, isEmailVerified } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.customerList(),
    queryFn: () => orderApi.getCustomerOrders(),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-border-main flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xl font-mono">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-text-main">{user?.name}</h1>
            <p className="text-xs text-text-muted font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isEmailVerified ? "success" : "warning"} size="sm">
            {isEmailVerified ? "EMAIL VERIFIED" : "UNVERIFIED"}
          </Badge>
          <Badge variant="glow" size="sm">
            VIP SHOPPER
          </Badge>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-primary" />
          <span>Past Orders & Live Tracking</span>
        </h2>

        {isLoading ? (
          <OrderCardSkeleton count={4} />
        ) : data?.orders?.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-card border border-border-main text-center text-xs text-text-muted font-mono">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.orders?.map((ord) => (
              <OrderSummaryCard key={ord._id} order={ord} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
