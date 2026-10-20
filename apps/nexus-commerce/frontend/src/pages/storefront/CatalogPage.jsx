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

  // 1. DERIVE state directly from URL (Single Source of Truth)
  const selectedCategory = searchParams.get("category") || "All";
  const debouncedSearch = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  // 2. Local state only for the instant-feedback search typing box
  const [searchQuery, setSearchQuery] = useState(debouncedSearch);

  // 3. Debounce URL update when user types in the search box
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParam = searchParams.get("search") || "";
      const trimmed = searchQuery.trim();

      // Only update URL if search string actually changed
      if (currentParam !== trimmed) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (trimmed) {
              next.set("search", trimmed);
            } else {
              next.delete("search");
            }
            next.delete("page"); // Reset to page 1 on new search
            return next;
          },
          { replace: true },
        );
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, searchParams, setSearchParams]);

  // 4. Parameter update handlers
  const handleSelectCategory = (cat) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === "All") {
        next.delete("category");
      } else {
        next.set("category", cat);
      }
      next.delete("page"); // Reset page when category changes
      return next;
    });
  };

  const handleSortChange = (newSort) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSort === "newest") {
        next.delete("sort");
      } else {
        next.set("sort", newSort);
      }
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSearchParams({}, { replace: true });
  };

  // 5. Query execution
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
        search: debouncedSearch || undefined,
        sort: sortBy,
        page,
        limit: 12,
      }),
    placeholderData: keepPreviousData,
  });

  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Explore Products
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Browse our curated collection of premium electronics, clothing, and
          everyday essentials.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <FacetedFilters
        categories={
          data?.categories || [
            "Electronics",
            "Clothing",
            "Footwear",
            "Accessories",
          ]
        }
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
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
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.pages > 1 && (
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-medium text-text-muted">
            Showing Page {pagination.page} of {pagination.pages} (
            {pagination.total} items)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1 || isFetching}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pagination.hasMore || isFetching}
              onClick={() => handlePageChange(page + 1)}
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
