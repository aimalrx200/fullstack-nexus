// apps/nexus-commerce/frontend/src/pages/storefront/CatalogPage.jsx

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { FacetedFilters } from "../../components/storefront/catalog/FacetedFilters";
import { ProductGrid } from "../../components/storefront/catalog/ProductGrid";
import { Button } from "../../components/common/Button";
import { productApi } from "../../lib/api/productApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // 300ms Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    setSearchParams(params, { replace: true });
  }, [selectedCategory, debouncedSearch, setSearchParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.products.list({
      category: selectedCategory,
      search: debouncedSearch,
      sort: sortBy,
      page,
      limit: 12,
    }),
    queryFn: () =>
      productApi.getProducts({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: debouncedSearch.trim() || undefined,
        sort: sortBy,
        page,
        limit: 12,
      }),
    placeholderData: keepPreviousData,
  });

  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Product Discovery & Catalog
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Showing real-time stock levels, multi-currency pricing, and flash-sale
          holds.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <FacetedFilters
        categories={
          data?.categories || [
            "Electronics",
            "Apparel",
            "Footwear",
            "Accessories",
          ]
        }
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={() => {
          setSelectedCategory("All");
          setSearchQuery("");
          setSortBy("newest");
          setPage(1);
        }}
      />

      {/* Product Grid */}
      <div
        className={`transition-opacity duration-200 ${
          isFetching && !isLoading
            ? "opacity-70 pointer-events-none"
            : "opacity-100"
        }`}
      >
        <ProductGrid
          products={data?.products || []}
          isLoading={isLoading}
          onResetFilters={() => {
            setSelectedCategory("All");
            setSearchQuery("");
            setPage(1);
          }}
        />
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.pages > 1 && (
        <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
          <span className="text-xs font-mono text-text-muted">
            Showing Page {pagination.page} of {pagination.pages} (
            {pagination.total} products)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pagination.hasMore || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
