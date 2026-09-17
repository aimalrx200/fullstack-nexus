import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VariantMatrixTable } from "../../components/admin/inventory/VariantMatrixTable";
import { LowStockAlerts } from "../../components/admin/inventory/LowStockAlerts";
import { StockOverrideModal } from "../../components/admin/inventory/StockOverrideModal";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { toast } from "sonner";

export function InventoryManagerPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingVariant, setEditingVariant] = useState(null);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: queryKeys.admin.inventory({ page }),
    queryFn: () => adminApi.getInventory({ page, limit: 15 }),
  });

  const { data: lowStockData } = useQuery({
    queryKey: queryKeys.admin.lowStock(),
    queryFn: () => adminApi.getLowStockAlerts(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      adminApi.updateStockOverride(payload.variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.inventory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.lowStock() });
      setEditingVariant(null);
      toast.success("Inventory stock override updated in real time!");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Inventory Matrix & 10m Hold Inspection
        </h1>
        <p className="text-xs text-text-muted">
          Physical stock, active flash-sale reservations, and instant override
          tools.
        </p>
      </div>

      {/* Low Stock Depletion Warning Panel */}
      <LowStockAlerts
        items={lowStockData?.lowStockVariants || []}
        onOverrideClick={(variant) => setEditingVariant(variant)}
      />

      {/* Full Variant Table */}
      <VariantMatrixTable
        inventory={inventoryData?.inventory || []}
        isLoading={isLoading}
        pagination={inventoryData?.pagination}
        onPaginationChange={setPage}
        onUpdateStock={updateMutation.mutate}
        isUpdating={updateMutation.isPending}
      />

      {editingVariant && (
        <StockOverrideModal
          isOpen={Boolean(editingVariant)}
          onClose={() => setEditingVariant(null)}
          variant={editingVariant}
          isLoading={updateMutation.isPending}
          onSave={updateMutation.mutate}
        />
      )}
    </div>
  );
}
