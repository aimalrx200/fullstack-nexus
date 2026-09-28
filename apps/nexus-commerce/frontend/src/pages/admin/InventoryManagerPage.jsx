// apps/nexus-commerce/frontend/src/pages/admin/InventoryManagerPage.jsx

import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { VariantMatrixTable } from "../../components/admin/inventory/VariantMatrixTable";
import { LowStockAlerts } from "../../components/admin/inventory/LowStockAlerts";
import { StockOverrideModal } from "../../components/admin/inventory/StockOverrideModal";
import { ProductCreationModal } from "../../components/admin/inventory/ProductCreationModal";
import { Button } from "../../components/common/Button";
import { adminApi } from "../../lib/api/adminApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { Plus, Layers } from "lucide-react";
import { toast } from "sonner";

export function InventoryManagerPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingVariant, setEditingVariant] = useState(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  // 1. Fetch paginated inventory SKUs
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: queryKeys.admin.inventory({ page }),
    queryFn: () => adminApi.getInventory({ page, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  // 2. Fetch active low-stock alerts
  const { data: lowStockData } = useQuery({
    queryKey: queryKeys.admin.lowStock(),
    queryFn: () => adminApi.getLowStockAlerts(),
  });

  // 3. Stock override mutation
  const updateStockMutation = useMutation({
    mutationFn: (payload) =>
      adminApi.updateStockOverride(payload.variantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.inventory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.lowStock() });
      setEditingVariant(null);
      toast.success("Inventory stock override updated in real time!");
    },
  });

  // 4. Create Product & Initial SKU Variant Mutation
  const createProductMutation = useMutation({
    mutationFn: async ({ formData, variantData }) => {
      // Step A: Upload product and images
      const product = await adminApi.createProduct(formData);

      // Step B: Provision initial SKU variant under this product
      if (product?._id) {
        await adminApi.createVariant({
          ...variantData,
          productId: product._id,
        });
      }

      return product;
    },
    onSuccess: (product) => {
      // Invalidate both inventory and storefront product catalog queries
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.inventory() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.lowStock() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      setIsCreateProductOpen(false);
      toast.success(
        `Product "${product.title}" published with physical stock!`,
      );
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create product");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header with Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Inventory Matrix & Catalog Control
          </h1>
          <p className="text-xs text-text-muted">
            Manage physical stock, active 10-minute checkout reservations, and
            publish new products.
          </p>
        </div>

        <Button
          variant="luxury"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateProductOpen(true)}
        >
          Add New Product
        </Button>
      </div>

      {/* Low Stock Depletion Warning Panel */}
      <LowStockAlerts
        items={lowStockData?.lowStockVariants || []}
        onOverrideClick={(variant) => setEditingVariant(variant)}
      />

      {/* Full Variant SKU Matrix Table */}
      <VariantMatrixTable
        inventory={inventoryData?.inventory || []}
        isLoading={isLoading}
        pagination={inventoryData?.pagination}
        onPaginationChange={setPage}
        onUpdateStock={updateStockMutation.mutate}
        isUpdating={updateStockMutation.isPending}
      />

      {/* Stock Override Modal */}
      {editingVariant && (
        <StockOverrideModal
          isOpen={Boolean(editingVariant)}
          onClose={() => setEditingVariant(null)}
          variant={editingVariant}
          isLoading={updateStockMutation.isPending}
          onSave={updateStockMutation.mutate}
        />
      )}

      {/* Product & Variant Creation Modal */}
      <ProductCreationModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onSave={createProductMutation.mutate}
        isLoading={createProductMutation.isPending}
      />
    </div>
  );
}
