// apps/nexus-commerce/frontend/src/pages/admin/AdminDashboardPage.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricsOverview } from "../../components/admin/dashboard/MetricsOverview";
import { LiveOrderStream } from "../../components/admin/dashboard/LiveOrderStream";
import { RecentOrdersCard } from "../../components/admin/dashboard/RecentOrdersCard";
import { SalesChart } from "../../components/admin/analytics/SalesChart";
import { GatewayPieChart } from "../../components/admin/analytics/GatewayPieChart";
import { DashboardSkeleton } from "../../components/feedback/DashboardSkeleton";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";

export function AdminDashboardPage() {
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: () => adminApi.getDashboardAnalytics(),
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: queryKeys.admin.orders({ limit: 5 }),
    queryFn: () => adminApi.getAllOrders({ limit: 5 }),
  });

  // Render matching metric cards and chart skeletons while queries are in flight
  if (isLoadingAnalytics || isLoadingOrders) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
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
