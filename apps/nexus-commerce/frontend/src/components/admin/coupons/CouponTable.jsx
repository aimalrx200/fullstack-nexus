import React, { useMemo } from "react";
import { Tag, Trash2, Edit } from "lucide-react";
import { DataTable } from "../../common/DataTable";
import { Badge } from "../../common/Badge";

export function CouponTable({
  coupons = [],
  isLoading = false,
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(
    () => [
      {
        header: "Promo Code",
        accessorKey: "code",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="font-mono font-bold text-xs text-text-main">
              {row.original.code}
            </span>
          </div>
        ),
      },
      {
        header: "Discount",
        accessorKey: "discountPercent",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-emerald-400">
            {row.original.discountPercent}% OFF
          </span>
        ),
      },
      {
        header: "Redemptions",
        accessorKey: "currentUsageCount",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-muted">
            {row.original.currentUsageCount || 0} uses
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "success" : "danger"}
            size="sm"
          >
            {row.original.isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="min-h-8 min-w-8 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated flex items-center justify-center transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original._id)}
              className="min-h-8 min-w-8 rounded-lg text-text-faint hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={coupons}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
    />
  );
}
