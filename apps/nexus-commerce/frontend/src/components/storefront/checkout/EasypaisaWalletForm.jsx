import React from "react";
import { PhoneInputField } from "./PhoneInputField";
import { ShieldCheck, Smartphone } from "lucide-react";

export function EasypaisaWalletForm({ mobileNumber, onChange, error }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-elevated border border-border-main space-y-3.5 animate-in fade-in">
      <div className="flex items-center gap-2 text-text-main">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs font-mono">
          EP
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-main">
            Easypaisa Direct Debit (03xx)
          </h4>
          <p className="text-[11px] text-text-muted">
            Pay seamlessly using your Easypaisa Mobile Account balance
          </p>
        </div>
      </div>

      <PhoneInputField
        value={mobileNumber}
        onChange={onChange}
        error={error}
        label="Easypaisa Registered Account Number"
        placeholder="0345 1234567"
      />

      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-start gap-2 text-[11px] text-text-muted">
        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          You will receive an in-app approval notification on your Easypaisa app
          to authorize this debit.
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Easypaisa Payment Gateway HMAC Tokenized</span>
      </div>
    </div>
  );
}
