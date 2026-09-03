// src/components/ThemeSelector.jsx

import { useDispatch, useSelector } from "react-redux";
import { setThemePreference } from "../../redux/slices/themeSlice";
import { Sun, Moon, Monitor } from "lucide-react";

export const ThemeSelector = () => {
  const dispatch = useDispatch();
  const currentPreference = useSelector((state) => state.theme.preference);

  const options = [
    { value: "system", label: "SYS", Icon: Monitor },
    { value: "light", label: "LIGHT", Icon: Sun },
    { value: "dark", label: "DARK", Icon: Moon },
  ];

  return (
    <div className="theme-selector-container">
      {options.map(({ value, label, Icon }) => {
        const isActive = currentPreference === value;
        return (
          <button
            key={value}
            onClick={() => dispatch(setThemePreference(value))}
            type="button"
            className={`theme-selector-btn ${
              isActive
                ? "theme-selector-btn-active"
                : "theme-selector-btn-inactive"
            }`}
            aria-label={`Set ${label} Theme`}
            aria-pressed={isActive}
          >
            <Icon className="theme-selector-icon" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
