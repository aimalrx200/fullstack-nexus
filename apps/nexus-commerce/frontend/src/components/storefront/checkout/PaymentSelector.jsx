import React from "react";
import { CreditCard, Smartphone, Banknote, ShieldCheck } from "lucide-react";
import { StripeCardElement } from "./StripeCardElement";
import { JazzCashWalletForm } from "./JazzCashWalletForm";
import { EasypaisaWalletForm } from "./EasypaisaWalletForm";
import { CODConfirmation } from "./CODConfirmation";

export function PaymentSelector({
  selectedMethod = "stripe",
  onSelectMethod,
  mobileNumber,
  onMobileNumberChange,
  totalUSD,
  totalPKR,
  errors = {},
}) {
  const GATEWAYS = [
    {
      id: "stripe",
      title: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, 3DS",
      icon: CreditCard,
      badge: "GLOBAL",
    },
    {
      id: "jazzcash",
      title: "JazzCash Mobile Wallet",
      subtitle: "Instant 03xx MPIN debit",
      icon: Smartphone,
      badge: "PKR ₨",
    },
    {
      id: "easypaisa",
      title: "Easypaisa Account",
      subtitle: "Mobile app direct debit",
      icon: Smartphone,
      badge: "PKR ₨",
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      subtitle: "Pay cash at doorstep",
      icon: Banknote,
      badge: "DOMESTIC",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-main block">
          Select Payment Gateway
        </label>
        <p className="text-[11px] text-text-muted">
          All transactions are processed over encrypted channels with zero
          credential storage.
        </p>
      </div>

      {/* Gateway Radio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {GATEWAYS.map((g) => {
          const isSelected = selectedMethod === g.id;
          const Icon = g.icon;

          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectMethod(g.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 select-none active:scale-[0.99] ${
                isSelected
                  ? "bg-brand-primary/10 border-brand-primary shadow-sm"
                  : "bg-surface-elevated hover:bg-surface-hover border-border-main"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-surface-card text-text-muted border border-border-subtle"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-text-main truncate">
                    {g.title}
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-surface-card border border-border-subtle text-text-muted font-bold">
                    {g.badge}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">
                  {g.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Gateway Form View */}
      <div className="pt-2">
        {selectedMethod === "stripe" && <StripeCardElement />}
        {selectedMethod === "jazzcash" && (
          <JazzCashWalletForm
            mobileNumber={mobileNumber}
            onChange={onMobileNumberChange}
            error={errors.mobileNumber}
          />
        )}
        {selectedMethod === "easypaisa" && (
          <EasypaisaWalletForm
            mobileNumber={mobileNumber}
            onChange={onMobileNumberChange}
            error={errors.mobileNumber}
          />
        )}
        {selectedMethod === "cod" && (
          <CODConfirmation totalUSD={totalUSD} totalPKR={totalPKR} />
        )}
      </div>
    </div>
  );
}
