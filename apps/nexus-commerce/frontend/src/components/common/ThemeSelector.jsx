// apps/nexus-commerce/frontend/src/components/common/ThemeSelector.jsx
import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeSelector({
  className = "",
  showLabels = false, // 👈 Clean icon-only default for popovers/toolbars
  compact = false,
}) {
  const { theme, setTheme, THEMES } = useTheme();

  const options = [
    { value: THEMES.LIGHT, label: "Light", icon: Sun },
    { value: THEMES.DARK, label: "Dark", icon: Moon },
    { value: THEMES.SYSTEM, label: "Auto", icon: Laptop },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-surface-elevated border border-border-main shadow-inner shrink-0 ${className}`}
      role="radiogroup"
      aria-label="Select Color Theme"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`min-h-8 min-w-8 ${
              showLabels && !compact ? "px-2.5" : "px-2"
            } rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-surface-card text-text-main shadow-xs border border-border-subtle font-semibold"
                : "text-text-muted hover:text-text-main"
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} Theme`}
            title={`${label} Mode`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {showLabels && !compact && <span className="text-xs">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
