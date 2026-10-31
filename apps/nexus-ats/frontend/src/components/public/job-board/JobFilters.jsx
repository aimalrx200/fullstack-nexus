import { Search, X } from "lucide-react";
import { DEPARTMENTS, WORKPLACE_TYPES } from "@/config/constants";

export default function JobFilters({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedWorkplace,
  onWorkplaceChange,
  onClearFilters,
}) {
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDepartment !== "All Departments" ||
    selectedWorkplace !== "All Locations";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "28px",
        width: "100%",
      }}
    >
      {/* Search Input Bar + Workplace Dropdown */}
      <div
        className="glass-panel"
        style={{
          padding: "8px 10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Dynamic Search: flex 1 1 180px with minWidth 0 */}
        <div
          style={{
            flex: "1 1 180px",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 6px",
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              minWidth: 0,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Workplace Dropdown */}
        <div style={{ flex: "0 1 auto", minWidth: 0 }}>
          <select
            value={selectedWorkplace}
            onChange={(e) => onWorkplaceChange(e.target.value)}
            style={{
              backgroundColor: "var(--bg-surface-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 10px",
              fontSize: "12px",
              outline: "none",
              cursor: "pointer",
              maxWidth: "100%",
            }}
          >
            {WORKPLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--danger)",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Department Filter Pills (Horizontal scrollable with no page blowout) */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedDepartment === dept;
          return (
            <button
              key={dept}
              onClick={() => onDepartmentChange(dept)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "12px",
                fontWeight: isSelected ? "700" : "500",
                backgroundColor: isSelected
                  ? "var(--primary)"
                  : "var(--bg-surface)",
                color: isSelected
                  ? "var(--primary-foreground)"
                  : "var(--text-secondary)",
                border: `1px solid ${isSelected ? "var(--primary)" : "var(--border-subtle)"}`,
                whiteSpace: "nowrap",
                transition: "var(--transition)",
                flexShrink: 0,
              }}
            >
              {dept}
            </button>
          );
        })}
      </div>
    </div>
  );
}
