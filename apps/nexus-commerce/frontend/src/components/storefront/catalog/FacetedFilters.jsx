import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export function FacetedFilters({
  categories = [],
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  onReset,
}) {
  return (
    <div className="p-4 rounded-2xl bg-surface-card border border-border-main space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <button
            type="button"
            onClick={() => onSelectCategory("All")}
            className={`min-h-9 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
              className={`min-h-9 px-3.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-primary text-white shadow-xs font-semibold"
                  : "bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-main"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="min-h-9 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
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
              className="min-h-9 px-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
