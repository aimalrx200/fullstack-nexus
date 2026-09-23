// apps/nexus-commerce/frontend/src/pages/storefront/ProductDetailPage.jsx

import React, { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductGalleryCarousel } from "../../components/storefront/product-detail/ProductGalleryCarousel";
import { ProductInfo } from "../../components/storefront/product-detail/ProductInfo";
import { ReviewSection } from "../../components/storefront/product-detail/ReviewSection";
import { VariantSelector } from "../../components/storefront/catalog/VariantSelector";
import { Button } from "../../components/common/Button";
import { ProductDetailSkeleton } from "../../components/feedback/ProductDetailSkeleton";
import { productApi } from "../../lib/api/productApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { useCart } from "../../hooks/useCart";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function ProductDetailPage() {
  const { slugOrId } = useParams();
  const { addToCart, isUpdatingCart } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.detail(slugOrId),
    queryFn: () => productApi.getProductBySlug(slugOrId),
  });

  const product = data?.product;
  const variants = data?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(null);

  const activeVariant = selectedVariant || variants[0] || null;

  // Render matching 2-column skeleton during query fetching
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-text-muted">
        Product not found.
      </div>
    );
  }

  const isSoldOut = activeVariant ? activeVariant.stock <= 0 : false;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in fade-in">
      {/* Top Half: Gallery & Buy Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery */}
        <ProductGalleryCarousel images={product.images || []} />

        {/* Product Information & Actions */}
        <div className="space-y-6 flex flex-col justify-center">
          <ProductInfo product={product} selectedVariant={activeVariant} />

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {product.description}
          </p>

          {/* Variant SKU Selector */}
          {variants.length > 0 && (
            <VariantSelector
              variants={variants}
              selectedVariant={activeVariant}
              onSelectVariant={setSelectedVariant}
            />
          )}

          {/* Purchase CTA */}
          <div className="pt-2 space-y-3">
            <Button
              variant={isSoldOut ? "secondary" : "luxury"}
              size="lg"
              icon={ShoppingBag}
              disabled={isSoldOut || isUpdatingCart}
              isLoading={isUpdatingCart}
              onClick={() => addToCart(activeVariant?._id, 1)}
              className="w-full text-base font-bold shadow-xl shadow-brand-primary/20"
            >
              {isSoldOut ? "Sold Out" : "Add to Shopping Bag"}
            </Button>

            {/* Guarantees Box */}
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle grid grid-cols-3 gap-2 text-center text-[11px] text-text-muted">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-brand-primary" />
                <span>1-2d Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3D Secure 2.0</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half: Customer Reviews */}
      <ReviewSection />
    </div>
  );
}
