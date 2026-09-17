import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/common/DataTable";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { useCurrency } from "../../hooks/useCurrency";
import { Badge } from "../../components/common/Badge";
import { User, KeyRound } from "lucide-react";

export function CustomerDirectoryPage() {
  const { formatPrice } = useCurrency();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.customers({ page }),
    queryFn: () => adminApi.getCustomers({ page, limit: 15 }),
  });

  const columns = useMemo(
    () => [
      {
        header: "Customer",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-main flex items-center justify-center text-xs font-bold font-mono">
              {row.original.name ? row.original.name[0] : "C"}
            </div>
            <div>
              <p className="font-semibold text-text-main">
                {row.original.name}
              </p>
              <p className="text-[11px] text-text-muted font-mono">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Passkeys",
        accessorKey: "passkeysCount",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs font-mono text-text-muted">
            <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
            <span>{row.original.passkeysCount || 0} devices</span>
          </div>
        ),
      },
      {
        header: "Orders Placed",
        accessorKey: "orderCount",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-main">
            {row.original.orderCount || 0} orders
          </span>
        ),
      },
      {
        header: "Lifetime Value (LTV)",
        accessorKey: "ltvUSD",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-400">
            {formatPrice(row.original.ltvUSD || 0, row.original.ltvPKR || 0)}
          </span>
        ),
      },
    ],
    [formatPrice],
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Customer Directory & Computed LTV
        </h1>
        <p className="text-xs text-text-muted">
          Customer lifetime value aggregation computed directly at the database
          level.
        </p>
      </div>

      <DataTable
        data={data?.customers || []}
        columns={columns}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPaginationChange={setPage}
      />
    </div>
  );
}
