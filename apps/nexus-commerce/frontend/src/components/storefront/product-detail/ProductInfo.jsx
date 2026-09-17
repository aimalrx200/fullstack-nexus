import React from "react";
import { Star, ShieldCheck, Tag } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";
import { StockTicker } from "../catalog/StockTicker";

export function ProductInfo({ product, selectedVariant }) {
  const { formatPrice } = useCurrency();

  const priceUSD = selectedVariant?.priceOverrideUSD || product?.basePriceUSD;
  const pricePKR = selectedVariant?.priceOverridePKR || product?.basePricePKR;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-brand-primary" />
          {product?.category || "General"}
        </span>

        <StockTicker
          productId={product?._id}
          initialStock={selectedVariant?.stock ?? 10}
          lowStockThreshold={selectedVariant?.lowStockThreshold ?? 5}
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
        {product?.title}
      </h1>

      {/* Ratings */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-current" />
          ))}
        </div>
        <span className="font-mono font-bold text-text-main">
          {product?.rating || 5.0}
        </span>
        <span className="text-text-muted font-mono">
          ({product?.reviewCount || 42} verified reviews)
        </span>
      </div>

      {/* Formatted Price */}
      <div className="pt-2">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-brand-primary">
          {formatPrice(priceUSD, pricePKR)}
        </span>
      </div>
    </div>
  );
}
