import React from "react";
import { PhoneInputField } from "./PhoneInputField";
import { ShieldCheck, Smartphone } from "lucide-react";

export function JazzCashWalletForm({ mobileNumber, onChange, error }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3.5 animate-in fade-in">
      <div className="flex items-center gap-2 text-text-main">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs font-mono">
          JC
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-main">
            JazzCash Mobile Wallet (03xx)
          </h4>
          <p className="text-[11px] text-text-muted">
            Instant direct debit via JazzCash Mobile Account
          </p>
        </div>
      </div>

      <PhoneInputField
        value={mobileNumber}
        onChange={onChange}
        error={error}
        label="JazzCash Registered Mobile Number"
        placeholder="0300 1234567"
      />

      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-start gap-2 text-[11px] text-text-muted">
        <Smartphone className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <span>
          After placing your order, an MPIN prompt will appear on your JazzCash
          mobile app or USSD prompt to authorize the transaction.
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Secured via JazzCash HMAC-SHA256 IPN Callback</span>
      </div>
    </div>
  );
}
