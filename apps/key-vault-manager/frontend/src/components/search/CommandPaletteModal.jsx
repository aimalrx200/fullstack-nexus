// src/components/search/CommandPaletteModal.jsx

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  Search,
  KeyRound,
  Folder,
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  FileCheck2,
  LayoutGrid,
  Settings2,
  CornerDownLeft,
  X,
  Copy,
} from "lucide-react";
import { getGlobalSearchItems } from "../../lib/vault/searchIndexService";
import { triggerToast } from "../../redux/slices/notificationSlice";

const ICON_MAP = {
  KeyRound,
  Folder,
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  FileCheck2,
  LayoutGrid,
  Settings2,
};

const CATEGORIES = [
  "All",
  "Secrets",
  "Engines",
  "Zero-Trust",
  "Identities",
  "Audit",
  "Actions",
];

function CommandPaletteDialog({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input on mount without setState
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allItems = useMemo(() => getGlobalSearchItems(), []);

  // Filter items dynamically
  const filteredItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!cleanQuery) return true;

      return (
        item.title.toLowerCase().includes(cleanQuery) ||
        item.subtitle.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery) ||
        (item.badge && item.badge.toLowerCase().includes(cleanQuery))
      );
    });
  }, [allItems, query, selectedCategory]);

  // Derive a safe index during render to guarantee no out-of-bounds crashes
  const safeSelectedIndex =
    selectedIndex < filteredItems.length ? selectedIndex : 0;

  // Event handlers that reset the cursor on user interaction
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedIndex(0);
  };

  const handleClearQuery = () => {
    setQuery("");
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev + 1 < filteredItems.length ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[safeSelectedIndex]) {
        handleSelectItem(filteredItems[safeSelectedIndex]);
      }
    }
  };

  const handleSelectItem = (item) => {
    onClose();
    if (item.copyValue) {
      navigator.clipboard.writeText(item.copyValue);
      dispatch(
        triggerToast({
          message: "Secret Copied",
          description: `Copied ${item.title} to clipboard.`,
          type: "success",
        }),
      );
    }
    if (item.route) {
      navigate(item.route);
    }
  };

  const getBadgeClass = (variant) => {
    switch (variant) {
      case "danger":
        return "command-palette-badge command-palette-badge-danger";
      case "warning":
        return "command-palette-badge command-palette-badge-warning";
      case "success":
        return "command-palette-badge command-palette-badge-success";
      case "muted":
      default:
        return "command-palette-badge command-palette-badge-muted";
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      className="command-palette-backdrop"
      onKeyDown={handleKeyDown}
    >
      <div
        className="command-palette-backdrop-dismiss"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="command-palette-card">
        {/* Terminal Header */}
        <div className="command-palette-header">
          <div className="command-palette-header-title-group">
            <span className="command-palette-badge-dot" />
            <h2
              id="command-palette-title"
              className="command-palette-header-title"
            >
              SYS // GLOBAL_VAULT_COMMAND_PALETTE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="command-palette-close-btn"
            aria-label="Close Command Palette"
            type="button"
          >
            <X className="command-palette-close-icon" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="command-palette-search-wrapper">
          <Search className="command-palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search secrets, engines, policies, identities, or audit logs..."
            className="command-palette-input"
          />
          {query && (
            <button
              onClick={handleClearQuery}
              className="command-palette-clear-btn"
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="command-palette-categories-bar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`command-palette-category-chip ${
                  isActive
                    ? "command-palette-category-chip-active"
                    : "command-palette-category-chip-inactive"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div ref={listRef} className="command-palette-results-list">
          {filteredItems.length === 0 ? (
            <div className="command-palette-empty-container">
              <p className="command-palette-empty-title">
                No matching records found
              </p>
              <p className="command-palette-empty-subtitle">
                Try searching by key name, CIDR, identity, or path...
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === safeSelectedIndex;
              const ItemIcon = ICON_MAP[item.icon] || KeyRound;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`command-palette-item ${
                    isSelected
                      ? "command-palette-item-selected"
                      : "command-palette-item-unselected"
                  }`}
                >
                  <div className="command-palette-item-content">
                    <div
                      className={`command-palette-item-icon-box ${
                        isSelected
                          ? "command-palette-item-icon-box-selected"
                          : "command-palette-item-icon-box-unselected"
                      }`}
                    >
                      <ItemIcon className="command-palette-item-icon" />
                    </div>

                    <div className="min-w-0">
                      <div className="command-palette-item-title-row">
                        <span className="command-palette-item-title">
                          {item.title}
                        </span>
                        <span className="command-palette-item-category">
                          [{item.category}]
                        </span>
                      </div>
                      <p className="command-palette-item-subtitle">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="command-palette-item-meta">
                    {item.badge && (
                      <span className={getBadgeClass(item.badgeVariant)}>
                        {item.badge}
                      </span>
                    )}
                    {item.copyValue && (
                      <Copy className="command-palette-copy-icon" />
                    )}
                    {isSelected && (
                      <CornerDownLeft className="command-palette-enter-icon" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcuts */}
        <div className="command-palette-footer">
          <div className="command-palette-shortcuts-group">
            <span>
              <kbd className="command-palette-kbd">↑</kbd>{" "}
              <kbd className="command-palette-kbd">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="command-palette-kbd">↵</kbd> Select / Copy
            </span>
            <span>
              <kbd className="command-palette-kbd">ESC</kbd> Close
            </span>
          </div>
          <span>
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CommandPaletteModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return <CommandPaletteDialog onClose={onClose} />;
}
