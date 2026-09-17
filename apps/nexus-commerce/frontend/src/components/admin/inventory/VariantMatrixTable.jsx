import React, { useMemo, useState } from "react";
import { Edit, Radio } from "lucide-react";
import { DataTable } from "../../common/DataTable";
import { StockOverrideModal } from "./StockOverrideModal";
import { Badge } from "../../common/Badge";
import { useCurrency } from "../../../hooks/useCurrency";

export function VariantMatrixTable({
  inventory = [],
  isLoading = false,
  pagination,
  onPaginationChange,
  onUpdateStock,
  isUpdating,
}) {
  const { formatPrice } = useCurrency();
  const [editingVariant, setEditingVariant] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: "SKU / Variant",
        accessorKey: "sku",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-xs text-text-main">
              {row.original.sku}
            </span>
            <span className="text-[11px] text-text-muted block truncate max-w-40">
              {row.original.productTitle} • {row.original.title}
            </span>
          </div>
        ),
      },
      {
        header: "Physical Stock",
        accessorKey: "physicalStock",
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-xs text-text-main">
            {row.original.physicalStock} units
          </span>
        ),
      },
      {
        header: "Active 10m Holds",
        accessorKey: "activeHolds",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-amber-400">
            {row.original.activeHolds || 0} held
          </span>
        ),
      },
      {
        header: "Available Stock",
        accessorKey: "availableStock",
        cell: ({ row }) => {
          const isLow = row.original.isLowStock;
          return (
            <Badge
              variant={isLow ? "warning" : "success"}
              size="sm"
              pulse={isLow}
            >
              {row.original.availableStock} Available
            </Badge>
          );
        },
      },
      {
        header: "Price",
        accessorKey: "priceUSD",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-text-main">
            {formatPrice(row.original.priceUSD, row.original.pricePKR)}
          </span>
        ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setEditingVariant(row.original)}
            className="min-h-8 px-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-brand-primary" />
            <span>Override</span>
          </button>
        ),
      },
    ],
    [formatPrice],
  );

  return (
    <>
      <DataTable
        data={inventory}
        columns={columns}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />

      <StockOverrideModal
        isOpen={Boolean(editingVariant)}
        onClose={() => setEditingVariant(null)}
        variant={editingVariant}
        isLoading={isUpdating}
        onSave={(data) => {
          onUpdateStock(data);
          setEditingVariant(null);
        }}
      />
    </>
  );
}
