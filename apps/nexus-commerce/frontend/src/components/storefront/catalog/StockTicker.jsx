import React, { useState } from "react";
import { Radio } from "lucide-react";
import { useProductStockStream } from "../../../hooks/useRealTimeSubsystems";

export function StockTicker({
  productId,
  initialStock = 0,
  lowStockThreshold = 5,
}) {
  const [stock, setStock] = useState(initialStock);

  // Bind live stock ticker via Server-Sent Events / Socket.io
  useProductStockStream(productId, {
    onStockUpdate: (data) => {
      if (typeof data.newStock === "number") {
        setStock(data.newStock);
      }
    },
  });

  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-mono font-semibold">
        Out of Stock
      </span>
    );
  }

  const isLowStock = stock <= lowStockThreshold;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border transition-colors ${
        isLowStock
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}
    >
      <Radio className={`w-3 h-3 ${isLowStock ? "animate-pulse" : ""}`} />
      <span>{isLowStock ? `Only ${stock} left!` : "In Stock"}</span>
    </span>
  );
}
