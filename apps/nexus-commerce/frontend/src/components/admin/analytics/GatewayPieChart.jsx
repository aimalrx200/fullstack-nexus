import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export function GatewayPieChart({ distribution = [] }) {
  const chartData =
    distribution.length > 0
      ? distribution.map((d) => ({
          name: d._id ? d._id.toUpperCase() : "OTHER",
          value: d.totalOrders || d.count || 1,
        }))
      : [
          { name: "STRIPE", value: 45 },
          { name: "JAZZCASH", value: 30 },
          { name: "EASYPAISA", value: 15 },
          { name: "COD", value: 10 },
        ];

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-border-main space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main">
          Payment Method Breakdown
        </h3>
        <p className="text-xs text-text-muted">
          Order share across Stripe, JazzCash, Easypaisa & COD
        </p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0d111a",
                borderColor: "rgba(255,255,255,0.12)",
                borderRadius: "0.75rem",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => (
                <span className="text-xs font-mono text-text-muted">{val}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
