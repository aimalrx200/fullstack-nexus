import React, { useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";
import { State, City } from "country-state-city";

export function AddressAutocomplete({
  street,
  city,
  state,
  postalCode,
  onChange,
  onAutoLocate,
  errors = {},
}) {
  // Query all provinces/states for Pakistan (ISO: PK)
  const pakistanStates = useMemo(() => State.getStatesOfCountry("PK"), []);

  // Selected state ISO code to query cities dynamically
  const selectedStateObj = useMemo(
    () => pakistanStates.find((s) => s.name === state),
    [pakistanStates, state],
  );

  // Query cities for the selected province
  const availableCities = useMemo(() => {
    if (selectedStateObj) {
      return City.getCitiesOfState("PK", selectedStateObj.isoCode);
    }
    return City.getCitiesOfCountry("PK") || [];
  }, [selectedStateObj]);

  return (
    <div className="space-y-3.5">
      {/* Street Address */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-text-muted">
            Delivery Street Address{" "}
            <span className="text-brand-primary">*</span>
          </label>
          {onAutoLocate && (
            <button
              type="button"
              onClick={onAutoLocate}
              className="text-[11px] text-brand-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Navigation className="w-3 h-3" />
              <span>Use Current GPS</span>
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="House #, Street name, Sector / Block"
            value={street}
            onChange={(e) => onChange("street", e.target.value)}
            className="w-full min-h-11 px-3.5 pl-10 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          <MapPin className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {errors.street && (
          <p className="text-[11px] text-rose-500">{errors.street}</p>
        )}
      </div>

      {/* State, City, Postal Code Dynamic Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Province / State */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Province / State <span className="text-brand-primary">*</span>
          </label>
          <select
            value={state}
            onChange={(e) => {
              onChange("state", e.target.value);
              onChange("city", ""); // Reset city when province changes
            }}
            className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors cursor-pointer"
          >
            <option value="">Select Province</option>
            {pakistanStates.map((s) => (
              <option key={s.isoCode} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-[11px] text-rose-500">{errors.state}</p>
          )}
        </div>

        {/* City Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            City <span className="text-brand-primary">*</span>
          </label>
          <select
            value={city}
            onChange={(e) => onChange("city", e.target.value)}
            className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary transition-colors cursor-pointer"
          >
            <option value="">Select City</option>
            {availableCities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-[11px] text-rose-500">{errors.city}</p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Postal Code <span className="text-brand-primary">*</span>
          </label>
          <input
            type="text"
            placeholder="54000"
            value={postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary transition-colors"
          />
          {errors.postalCode && (
            <p className="text-[11px] text-rose-500">{errors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}
