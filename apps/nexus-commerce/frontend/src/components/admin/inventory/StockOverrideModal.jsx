import React, { useState } from "react";
import { Layers, CheckCircle2 } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";

export function StockOverrideModal({
  isOpen,
  onClose,
  variant,
  onSave,
  isLoading,
}) {
  const [stock, setStock] = useState(variant?.physicalStock ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    variant?.lowStockThreshold ?? 5,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      variantId: variant?.variantId || variant?._id,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Override Inventory Stock"
      description={`SKU: ${variant?.sku || "NEX-VAR"}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Physical Warehouse Stock on Hand
          </label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Low Stock Depletion Warning Threshold
          </label>
          <input
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={CheckCircle2}
            isLoading={isLoading}
          >
            Update SKU Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
