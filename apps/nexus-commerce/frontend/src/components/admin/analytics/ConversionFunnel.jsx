import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FUNNEL_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#10b981"];

export function ConversionFunnel() {
  const data = [
    { stage: "Catalog Views", count: 4800 },
    { stage: "Added to Bag", count: 1650 },
    { stage: "Checkout Locks", count: 820 },
    { stage: "Paid Orders", count: 640 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            Checkout Conversion Funnel
          </h3>
          <p className="text-xs text-text-muted">
            End-to-end user progression rate: 13.3%
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-brand-primary">
          High Performance
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
            />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="#64748b"
              fontSize={11}
              width={100}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d111a",
                borderColor: "rgba(255,255,255,0.12)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
