import React from "react";
import { Check, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export function CheckoutStepper({ currentStep = 1, onStepClick }) {
  const steps = [
    { id: 1, label: "Delivery Address", icon: MapPin },
    { id: 2, label: "Payment Gateway", icon: CreditCard },
    { id: 3, label: "Order Confirmed", icon: ShieldCheck },
  ];

  return (
    <div className="w-full py-4 border-b border-border-subtle mb-6">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-surface-elevated z-0">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{
              width:
                currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
            }}
          />
        </div>

        {steps.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
            >
              <button
                type="button"
                disabled={!isComplete && !isCurrent}
                onClick={() => isComplete && onStepClick?.(step.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isComplete
                    ? "bg-brand-primary text-white cursor-pointer shadow-sm shadow-brand-primary/30"
                    : isCurrent
                      ? "bg-surface-card text-brand-primary border-2 border-brand-primary shadow-md shadow-brand-primary/20 scale-105"
                      : "bg-surface-elevated text-text-muted border border-border-main cursor-not-allowed opacity-60"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </button>
              <span
                className={`mt-1.5 text-[11px] font-medium tracking-tight ${
                  isCurrent ? "text-text-main font-semibold" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
