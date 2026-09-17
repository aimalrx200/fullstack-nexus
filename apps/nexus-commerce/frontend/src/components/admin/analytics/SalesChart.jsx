import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useCurrency } from "../../../hooks/useCurrency";

export function SalesChart({ data = [] }) {
  const { formatPrice } = useCurrency();

  const chartData =
    data.length > 0
      ? data
      : [
          { day: "Mon", gmv: 1200, orders: 14 },
          { day: "Tue", gmv: 2100, orders: 22 },
          { day: "Wed", gmv: 1800, orders: 19 },
          { day: "Thu", gmv: 3400, orders: 38 },
          { day: "Fri", gmv: 4200, orders: 49 },
          { day: "Sat", gmv: 5600, orders: 62 },
          { day: "Sun", gmv: 4900, orders: 54 },
        ];

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-main">
            Gross Merchandise Value (GMV)
          </h3>
          <p className="text-xs text-text-muted">
            7-Day rolling sales performance
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400">
          +24.8% vs last week
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gmvAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d111a",
                borderColor: "rgba(255,255,255,0.12)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
              formatter={(val) => [formatPrice(val, val * 280), "GMV Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="gmv"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gmvAreaGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
