import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium tracking-tight rounded-xl transition-all select-none cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  // Mobile-first touch targets: min-height >= 44px
  const sizeStyles = {
    sm: "min-h-[40px] px-3.5 py-1.5 text-xs gap-1.5",
    md: "min-h-[44px] px-5 py-2 text-sm gap-2",
    lg: "min-h-[52px] px-6 py-3 text-base gap-2.5",
    icon: "min-h-[44px] min-w-[44px] p-2",
  };

  const variantStyles = {
    primary:
      "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30 border border-brand-primary/20",
    secondary:
      "bg-surface-elevated hover:bg-surface-hover text-text-main border border-border-main shadow-xs",
    outline:
      "bg-transparent hover:bg-surface-elevated text-text-main border border-border-main hover:border-text-muted",
    ghost:
      "bg-transparent hover:bg-surface-elevated text-text-muted hover:text-text-main",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
    luxury:
      "bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-white/15",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
