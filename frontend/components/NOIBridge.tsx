"use client";

import type { NOIBridgeItem } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function NOIBridge({ data }: { data: NOIBridgeItem[] }) {
  if (!data || data.length === 0) return null;

  // Transform data for the waterfall chart
  let runningTotal = 0;
  
  const chartData = data.map((item) => {
    let start = 0;
    let end = 0;
    let color = "";

    if (item.type === "income" || item.type === "subtotal") {
      start = 0;
      end = item.value;
      runningTotal = item.value;
      color = "#34D399"; // profit (green)
    } else if (item.type === "deduction") {
      start = runningTotal;
      end = runningTotal - Math.abs(item.value);
      runningTotal = end;
      color = "#FB7185"; // loss (red)
    }

    return {
      name: item.label,
      start,
      end,
      value: item.value,
      type: item.type,
      color,
      // For Recharts to draw floating bars, we need an array [min, max]
      range: [Math.min(start, end), Math.max(start, end)],
    };
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short"
    }).format(val);

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-cyan animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          NOI Waterfall Bridge
        </h2>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#1F2937' }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#1F2937' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card p-3 border border-dex-border shadow-xl">
                      <p className="text-xs font-semibold text-dex-tx mb-1">{data.name}</p>
                      <p className={`text-sm font-mono font-bold ${data.type === 'deduction' ? 'text-loss' : 'text-profit'}`}>
                        {data.type === 'deduction' ? '-' : ''}
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(data.value))}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="range" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
