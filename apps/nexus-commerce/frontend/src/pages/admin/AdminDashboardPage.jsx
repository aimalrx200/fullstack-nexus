// apps/nexus-commerce/frontend/src/pages/admin/AdminDashboardPage.jsx

import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MetricsOverview } from "../../components/admin/dashboard/MetricsOverview";
import { LiveOrderStream } from "../../components/admin/dashboard/LiveOrderStream";
import { RecentOrdersCard } from "../../components/admin/dashboard/RecentOrdersCard";
import { SalesChart } from "../../components/admin/analytics/SalesChart";
import { GatewayPieChart } from "../../components/admin/analytics/GatewayPieChart";
import { DashboardSkeleton } from "../../components/feedback/DashboardSkeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";

export function AdminDashboardPage() {
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: () => adminApi.getDashboardAnalytics(),
    placeholderData: keepPreviousData,
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: queryKeys.admin.orders({ limit: 5 }),
    queryFn: () => adminApi.getAllOrders({ limit: 5 }),
    placeholderData: keepPreviousData,
  });

  const isInitialLoading = isLoadingAnalytics || isLoadingOrders;

  // ⏱️ Delay skeleton by 150ms (skips on cache hits) and holds for 400ms for visual stability
  const showSkeleton = useDelayedLoading(isInitialLoading, {
    delay: 150,
    minDuration: 3000,
  });

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  // Prevent layout flash during the first 150ms window before skeleton or data renders
  if (isInitialLoading && !analyticsData) {
    return <div className="w-full min-h-125" aria-busy="true" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 ease-out">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Merchant Control Center
        </h1>
        <p className="text-xs text-text-muted">
          Live order feeds, sales metrics, and real-time inventory
          synchronization.
        </p>
      </div>

      <MetricsOverview metrics={analyticsData?.metrics || {}} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveOrderStream />
        <RecentOrdersCard orders={ordersData?.orders || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <GatewayPieChart
          distribution={analyticsData?.charts?.gatewayDistribution || []}
        />
      </div>
    </div>
  );
}
