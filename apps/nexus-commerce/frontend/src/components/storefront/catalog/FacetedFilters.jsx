// apps/nexus-commerce/frontend/src/components/storefront/catalog/FacetedFilters.jsx

import { Search, X, RotateCcw } from "lucide-react";

export function FacetedFilters({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onReset,
}) {
  return (
    <div className="p-4 rounded-2xl bg-surface-card border border-border-main space-y-4 mb-6 shadow-xs">
      {/* Top Row: Search Input & Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search products by name, specs, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-10 pl-9 pr-8 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="min-h-10 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-10 px-3 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Category Swatches */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          className={`min-h-8.5 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
            selectedCategory === "All"
              ? "bg-brand-primary text-white shadow-xs font-semibold"
              : "bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-main"
          }`}
        >
          All Products
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`min-h-8.5 px-3.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
              selectedCategory === cat
                ? "bg-brand-primary text-white shadow-xs font-semibold"
                : "bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-main"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
