import React from "react";
import { Zap } from "lucide-react";

export function CannedResponsePicker({ onSelectResponse }) {
  const CANNED_TEMPLATES = [
    {
      title: "Delivery Timeline",
      text: "Standard courier delivery takes 1-2 business days for Lahore metro and 3-5 business days nationwide.",
    },
    {
      title: "Return Policy",
      text: "We offer a 7-day hassle-free return window on unworn items with original tags attached.",
    },
    {
      title: "JazzCash / Easypaisa Help",
      text: "Please authorize the MPIN approval prompt on your mobile wallet app within 5 minutes to confirm the transaction.",
    },
  ];

  return (
    <div className="p-2 bg-surface-elevated border-t border-border-subtle flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
      <span className="text-[10px] font-mono text-text-faint flex items-center gap-1 shrink-0 px-2">
        <Zap className="w-3 h-3 text-amber-400" />
        <span>Quick Answers:</span>
      </span>

      {CANNED_TEMPLATES.map((tpl, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelectResponse(tpl.text)}
          className="min-h-7 px-2.5 rounded-lg bg-surface-card hover:bg-surface-hover text-text-muted hover:text-text-main border border-border-subtle text-[11px] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          {tpl.title}
        </button>
      ))}
    </div>
  );
}
