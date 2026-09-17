import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = "md",
  label = "Loading...",
  className = "",
}) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-text-muted text-xs font-mono py-8 ${className}`}
    >
      <Loader2
        className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-primary`}
      />
      {label && <span>{label}</span>}
    </div>
  );
}
