import React from "react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "../../feedback/ProductCardSkeleton";
import { EmptyState } from "../../feedback/EmptyState";

export function ProductGrid({
  products = [],
  isLoading = false,
  onResetFilters,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products matched your criteria"
        description="Try searching with a different keyword or resetting your category filters."
        actionLabel={onResetFilters ? "Reset Filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
