// apps/nexus-commerce/frontend/src/pages/admin/AnalyticsPage.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SalesChart } from "../../components/admin/analytics/SalesChart";
import { GatewayPieChart } from "../../components/admin/analytics/GatewayPieChart";
import { ConversionFunnel } from "../../components/admin/analytics/ConversionFunnel";
import { DashboardSkeleton } from "../../components/feedback/DashboardSkeleton";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: () => adminApi.getDashboardAnalytics(),
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Revenue & Conversion Analytics
        </h1>
        <p className="text-xs text-text-muted">
          Recharts-driven GMV trends and gateway revenue distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <ConversionFunnel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GatewayPieChart
          distribution={data?.charts?.gatewayDistribution || []}
        />
      </div>
    </div>
  );
}
