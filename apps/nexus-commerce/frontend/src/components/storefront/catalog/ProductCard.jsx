// apps/nexus-commerce/frontend/src/components/storefront/catalog/ProductCard.jsx

import React, { useState } from "react";
import { ShoppingBag, Sparkles, Play } from "lucide-react";
import { useCurrency } from "../../../hooks/useCurrency";
import { useCart } from "../../../hooks/useCart";
import { StockTicker } from "./StockTicker";
import { VariantSelector } from "./VariantSelector";
import { Button } from "../../common/Button";

export function ProductCard({ product }) {
  const { formatPrice } = useCurrency();
  const { addToCart, isUpdatingCart } = useCart();

  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Active Variant resolution: explicitly selected variant -> first variant -> null
  const activeVariant = selectedVariant || variants[0] || null;

  const primaryImage =
    activeVariant?.image ||
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

  const hasVideo = Boolean(product?.video?.url);

  // Price Resolution (Variant override > Base Price)
  const currentPriceUSD =
    activeVariant?.priceOverrideUSD || product?.basePriceUSD || 0;
  const currentPricePKR =
    activeVariant?.priceOverridePKR || product?.basePricePKR || 0;

  const handleAddToCart = () => {
    const targetVariantId = activeVariant?._id || variants[0]?._id;
    if (targetVariantId) {
      addToCart(targetVariantId, 1);
    }
  };

  const isSoldOut = activeVariant ? activeVariant.stock <= 0 : false;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl bg-surface-card border border-border-main hover:border-brand-primary/40 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-brand-primary/5 flex flex-col overflow-hidden"
    >
      {/* Image Showcase Frame (No heavy hover video mounting) */}
      <div className="relative w-full aspect-square bg-surface-elevated/40 overflow-hidden flex items-center justify-center p-4 border-b border-border-subtle">
        {/* Ambient Studio Spotlight Glow */}
        <div className="absolute inset-0 bg-radial from-white/5 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Crisp Product Image with Smooth Hardware-Accelerated Zoom */}
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain object-center drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out z-10 select-none"
        />

        {/* Featured Pill Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm z-20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>FEATURED</span>
          </div>
        )}

        {/* Showcase Video Indicator Badge */}
        {hasVideo && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm z-20">
            <Play className="w-2.5 h-2.5 fill-current text-brand-primary" />
            <span>VIDEO</span>
          </div>
        )}

        {/* Stock Ticker Badge */}
        <div className="absolute top-3 right-3 z-20">
          <StockTicker
            productId={product._id}
            initialStock={activeVariant?.stock ?? 10}
            lowStockThreshold={activeVariant?.lowStockThreshold ?? 5}
          />
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3">
        {/* Category Tag */}
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
            selectedVariant={activeVariant}
            onSelectVariant={setSelectedVariant}
          />
        )}

        {/* Price & Add to Bag CTA */}
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
            disabled={isSoldOut || isUpdatingCart || !activeVariant}
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

export default ProductCard;
