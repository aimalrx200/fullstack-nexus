// apps/nexus-commerce/frontend/src/pages/storefront/OrderTrackingPage.jsx

import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LiveDeliveryMap } from "../../components/storefront/orders/LiveDeliveryMap";
import { OrderTimeline } from "../../components/storefront/orders/OrderTimeline";
import { OrderSummaryCard } from "../../components/storefront/orders/OrderSummaryCard";
import { OrderCardSkeleton } from "../../components/feedback/OrderCardSkeleton";
import { orderApi } from "../../lib/api/orderApi";
import { queryKeys } from "../../lib/api/queryKeys";

export function OrderTrackingPage() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
        {/* Radar Map Skeleton */}
        <div className="w-full h-80 rounded-2xl bg-surface-card border border-border-main p-6 space-y-4 shimmer-wave overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="w-48 h-5 rounded-lg bg-surface-elevated animate-pulse" />
            <div className="w-24 h-6 rounded-full bg-surface-elevated animate-pulse" />
          </div>
          <div className="w-full h-52 rounded-xl bg-slate-950/70 border border-border-subtle animate-pulse" />
        </div>

        {/* Timeline & Summary Skeleton Grid */}
        <OrderCardSkeleton count={2} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-text-muted">
        Order not found or access requires verification.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-text-main font-mono">
          Live Delivery Radar
        </h1>
        <p className="text-xs text-text-muted">
          Real-time GPS telemetry from Central Fulfillment Hub to your doorstep.
        </p>
      </div>

      <LiveDeliveryMap order={order} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderTimeline
          status={order.fulfillmentStatus}
          timeline={order.timeline || []}
        />
        <OrderSummaryCard order={order} />
      </div>
    </div>
  );
}
