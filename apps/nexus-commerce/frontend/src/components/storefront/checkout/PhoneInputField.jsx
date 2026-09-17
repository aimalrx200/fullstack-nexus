import React from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export function PhoneInputField({
  value,
  onChange,
  error,
  label = "Contact Mobile Number",
  required = true,
  className = "",
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-medium text-text-muted">
        {label} {required && <span className="text-brand-primary">*</span>}
      </label>

      <div className="phone-input-wrapper">
        <PhoneInput
          defaultCountry="pk"
          value={value}
          onChange={(phone) => onChange(phone)}
          inputClassName="!w-full !min-h-[44px] !bg-surface-elevated !border-border-main !text-text-main !text-xs !font-mono !rounded-r-xl focus:!border-brand-primary"
          countrySelectorStyleProps={{
            buttonClassName:
              "!min-h-[44px] !bg-surface-card !border-border-main !rounded-l-xl !px-3",
          }}
        />
      </div>

      {error && <p className="text-[11px] text-rose-500 font-mono">{error}</p>}
    </div>
  );
}
