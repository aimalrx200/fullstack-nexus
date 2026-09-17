import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { FacetedFilters } from "../../components/storefront/catalog/FacetedFilters";
import { ProductGrid } from "../../components/storefront/catalog/ProductGrid";
import { productApi } from "../../lib/api/productApi";
import { queryKeys } from "../../lib/api/queryKeys";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list({
      category: selectedCategory,
      sort: sortBy,
    }),
    queryFn: () =>
      productApi.getProducts({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        sort: sortBy,
      }),
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Product Discovery & Catalog
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Showing real-time stock levels and multi-currency pricing.
        </p>
      </div>

      <FacetedFilters
        categories={
          data?.categories || ["Electronics", "Apparel", "Accessories"]
        }
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchParams(cat !== "All" ? { category: cat } : {});
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={() => {
          setSelectedCategory("All");
          setSortBy("newest");
          setSearchParams({});
        }}
      />

      <ProductGrid
        products={data?.products || []}
        isLoading={isLoading}
        onResetFilters={() => setSelectedCategory("All")}
      />
    </div>
  );
}
