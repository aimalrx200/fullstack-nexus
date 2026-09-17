import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeSelector({ className = "" }) {
  const { theme, setTheme, THEMES } = useTheme();

  const options = [
    { value: THEMES.LIGHT, label: "Light", icon: Sun },
    { value: THEMES.DARK, label: "Dark", icon: Moon },
    { value: THEMES.SYSTEM, label: "Auto", icon: Laptop },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-surface-elevated border border-border-main shadow-inner ${className}`}
      role="radiogroup"
      aria-label="Select Color Theme"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`min-h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-surface-card text-text-main shadow-xs border border-border-subtle"
                : "text-text-muted hover:text-text-main"
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} Theme`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
