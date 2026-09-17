import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LiveDeliveryMap } from "../../components/storefront/orders/LiveDeliveryMap";
import { OrderTimeline } from "../../components/storefront/orders/OrderTimeline";
import { OrderSummaryCard } from "../../components/storefront/orders/OrderSummaryCard";
import { orderApi } from "../../lib/api/orderApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { Loader2 } from "lucide-react";

export function OrderTrackingPage() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-xs text-text-muted font-mono">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        <span>Connecting to Live Radar stream...</span>
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
          Live Radar Delivery Radar
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
