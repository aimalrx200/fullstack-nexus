import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";

export function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const { formatPrice } = useCurrency();

  const variant = item?.variantId;
  const product = item?.productId;

  const itemImage =
    variant?.image ||
    product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80";

  const unitPriceUSD =
    item.priceAtAdditionUSD ||
    variant?.priceOverrideUSD ||
    product?.basePriceUSD;
  const unitPricePKR =
    item.priceAtAdditionPKR ||
    variant?.priceOverridePKR ||
    product?.basePricePKR;

  const maxStock = variant?.stock || 99;

  return (
    <div className="py-4 flex items-center gap-3.5 border-b border-border-subtle last:border-b-0 animate-in fade-in">
      {/* Thumbnail */}
      <img
        src={itemImage}
        alt={product?.title || "Product item"}
        className="w-16 h-16 rounded-xl bg-surface-elevated object-cover shrink-0 border border-border-subtle"
      />

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-xs font-semibold text-text-main truncate">
          {product?.title || "Product"}
        </h4>
        <p className="text-[11px] font-mono text-text-muted truncate">
          {variant?.title || variant?.sku || "Default Variant"}
        </p>
        <p className="text-xs font-mono font-bold text-text-main">
          {formatPrice(unitPriceUSD, unitPricePKR)}
        </p>
      </div>

      {/* Quantity Stepper & Remove */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => onRemove(variant?._id || item.variantId)}
          className="min-h-8 min-w-8 rounded-lg text-text-faint hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Remove item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center rounded-lg bg-surface-elevated border border-border-main p-0.5">
          <button
            type="button"
            onClick={() =>
              onUpdateQuantity(
                variant?._id || item.variantId,
                item.quantity - 1,
              )
            }
            className="min-h-8 min-w-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="w-7 text-center font-mono font-semibold text-xs text-text-main select-none">
            {item.quantity}
          </span>

          <button
            type="button"
            disabled={item.quantity >= maxStock}
            onClick={() =>
              onUpdateQuantity(
                variant?._id || item.variantId,
                item.quantity + 1,
              )
            }
            className="min-h-8 min-w-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
