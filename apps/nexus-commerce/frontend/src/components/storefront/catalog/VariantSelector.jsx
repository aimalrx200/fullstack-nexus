import React from "react";

export function VariantSelector({
  variants = [],
  selectedVariant,
  onSelectVariant,
  className = "",
}) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted">
        Select Variant / SKU
      </label>

      <div className="flex flex-wrap gap-1.5">
        {variants.map((v) => {
          const isSelected = selectedVariant?._id === v._id;
          const isOutOfStock = v.stock <= 0;

          return (
            <button
              key={v._id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(v)}
              className={`min-h-9.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
                isSelected
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs shadow-brand-primary/30 font-semibold"
                  : "bg-surface-elevated hover:bg-surface-hover text-text-main border-border-main"
              }`}
            >
              <span>{v.title}</span>
              {isOutOfStock && (
                <span className="ml-1 text-[10px] text-rose-400 font-mono">
                  (Sold Out)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
