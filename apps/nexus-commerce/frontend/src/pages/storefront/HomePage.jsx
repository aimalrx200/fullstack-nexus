// apps/nexus-commerce/frontend/src/pages/storefront/HomePage.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { HeroCarousel } from "../../components/storefront/catalog/HeroCarousel";
import { ProductGrid } from "../../components/storefront/catalog/ProductGrid";
import { productApi } from "../../lib/api/productApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { Sparkles } from "lucide-react";
import { HeroCarouselSkeleton } from "../../components/feedback/HeroCarouselSkeleton";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";

export function HomePage() {
  // 1. Fetch featured products
  const { data: featuredData, isLoading: heroSectionLoading } = useQuery({
    queryKey: queryKeys.products.list({ isFeatured: true, limit: 5 }),
    queryFn: () => productApi.getProducts({ isFeatured: true, limit: 5 }),
  });

  // 2. Fetch catalog items
  const { data: catalogData, isLoading } = useQuery({
    queryKey: queryKeys.products.list({ limit: 8 }),
    queryFn: () => productApi.getProducts({ limit: 8 }),
  });

  // 3. Derive deferred loading state at the parent level
  const showHeroSkeleton = useDelayedLoading(heroSectionLoading, {
    delay: 150,
    minDuration: 3000,
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 
        Controlled by showHeroSkeleton.
        Will hold for 3000ms minimum if the 150ms delay threshold was passed.
      */}
      {showHeroSkeleton ? (
        <HeroCarouselSkeleton />
      ) : (
        <HeroCarousel products={featuredData?.products || []} />
      )}

      {/* Featured Collections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span>Featured Collections & Flash Drops</span>
            </h2>
            <p className="text-xs text-text-muted">
              Real-time inventory locks guarantee stock while you checkout.
            </p>
          </div>
          <a
            href="/catalog"
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            View All →
          </a>
        </div>

        <ProductGrid
          products={catalogData?.products || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default HomePage;
