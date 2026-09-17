import React, { useState } from "react";
import { ShoppingBag, Eye, Sparkles } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";
import { useCart } from "../../../hooks/useCart";
import { StockTicker } from "./StockTicker";
import { VariantSelector } from "./VariantSelector";
import { Button } from "../../common/Button";

export function ProductCard({ product }) {
  const { formatPrice } = useCurrency();
  const { addToCart, isUpdatingCart } = useCart();

  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    selectedVariant?.image ||
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

  // Price Resolution (Variant override > Base Price)
  const currentPriceUSD =
    selectedVariant?.priceOverrideUSD || product?.basePriceUSD;
  const currentPricePKR =
    selectedVariant?.priceOverridePKR || product?.basePricePKR;

  const handleAddToCart = () => {
    if (selectedVariant?._id) {
      addToCart(selectedVariant._id, 1);
    }
  };

  const isSoldOut = selectedVariant ? selectedVariant.stock <= 0 : false;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl bg-surface-card border border-border-main hover:border-brand-primary/40 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-brand-primary/5 flex flex-col overflow-hidden"
    >
      {/* Image Thumbnail Frame */}
      <div className="relative w-full aspect-square bg-surface-elevated overflow-hidden">
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Featured Tag */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>FEATURED</span>
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <StockTicker
            productId={product._id}
            initialStock={selectedVariant?.stock ?? 10}
            lowStockThreshold={selectedVariant?.lowStockThreshold ?? 5}
          />
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
        {/* Category Pill */}
        <span className="text-[11px] font-mono font-medium text-text-muted uppercase tracking-wider">
          {product.category || "General"}
        </span>

        {/* Product Title */}
        <h3 className="text-sm sm:text-base font-semibold text-text-main line-clamp-1 group-hover:text-brand-primary transition-colors tracking-tight">
          <a href={`/product/${product.slug || product._id}`}>
            {product.title}
          </a>
        </h3>

        {/* Variant SKU Swatches */}
        {variants.length > 1 && (
          <VariantSelector
            variants={variants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
          />
        )}

        {/* Price & Add to Bag Button */}
        <div className="pt-3 mt-auto border-t border-border-subtle flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-text-muted block font-mono">
              Price
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-text-main">
              {formatPrice(currentPriceUSD, currentPricePKR)}
            </span>
          </div>

          <Button
            variant={isSoldOut ? "secondary" : "primary"}
            size="md"
            icon={ShoppingBag}
            disabled={isSoldOut || isUpdatingCart}
            isLoading={isUpdatingCart && isHovered}
            onClick={handleAddToCart}
            className="shrink-0"
          >
            {isSoldOut ? "Sold Out" : "Add to Bag"}
          </Button>
        </div>
      </div>
    </article>
  );
}
