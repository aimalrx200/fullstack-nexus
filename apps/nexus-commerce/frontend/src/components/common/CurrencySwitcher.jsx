import React from "react";
import { useCurrency } from "../../hooks/useCurrency";
import { CURRENCIES } from "../../config/constants";

export function CurrencySwitcher({ className = "" }) {
  const { activeCurrency, setCurrency } = useCurrency();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-surface-elevated border border-border-main ${className}`}
      role="radiogroup"
      aria-label="Select Currency"
    >
      {[CURRENCIES.USD, CURRENCIES.PKR].map((curr) => {
        const isActive = activeCurrency === curr;
        return (
          <button
            key={curr}
            onClick={() => setCurrency(curr)}
            className={`min-h-8.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-brand-primary text-white shadow-xs shadow-brand-primary/20"
                : "text-text-muted hover:text-text-main"
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${curr}`}
          >
            {curr === "USD" ? "$ USD" : "₨ PKR"}
          </button>
        );
      })}
    </div>
  );
}
