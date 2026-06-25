"use client";

import type { NOIBridgeItem } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function NOIBridge({ data }: { data: NOIBridgeItem[] }) {
  if (!data || data.length === 0) return null;

  const chartData = data.reduce<{
    result: Array<{
      name: string;
      start: number;
      end: number;
      value: number;
      type: string;
      color: string;
      // Recharts stacked bar trick: invisible "spacer" bar + visible bar
      spacer: number;
      bar: number;
    }>;
    running: number;
  }>(
    (acc, item) => {
      let spacer = 0;
      let bar = 0;
      let newRunning = acc.running;
      let color = "";

      if (item.type === "income") {
        spacer = 0;
        bar = item.value;
        newRunning = item.value;
        color = "#34D399";
      } else if (item.type === "subtotal") {
        spacer = 0;
        bar = item.value;
        newRunning = item.value;
        color = "#38BDF8";
      } else {
        // deduction — float the bar down from running total
        const absVal = Math.abs(item.value);
        spacer = acc.running - absVal;
        bar = absVal;
        newRunning = acc.running - absVal;
        color = "#FB7185";
      }

      acc.result.push({
        name: item.label,
        start: spacer,
        end: spacer + bar,
        value: item.value,
        type: item.type,
        color,
        spacer,
        bar,
      });

      return { result: acc.result, running: newRunning };
    },
    { result: [], running: 0 }
  ).result;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      notation: "compact",
      compactDisplay: "short",
    }).format(val);

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-cyan animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          NOI Waterfall Bridge
        </h2>
      </div>

      {/* Fixed-height wrapper prevents the Recharts width=-1 bug */}
      <div className="flex-1" style={{ minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1F2937"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "monospace" }}
              axisLine={{ stroke: "#1F2937" }}
              tickLine={false}
              angle={-40}
              textAnchor="end"
              height={65}
              interval={0}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }}
              axisLine={{ stroke: "#1F2937" }}
              tickLine={false}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as (typeof chartData)[number];
                  return (
                    <div className="glass-card p-3 border border-dex-border shadow-xl text-xs font-mono">
                      <p className="font-semibold text-dex-tx mb-1">{d.name}</p>
                      <p
                        className={
                          d.type === "deduction" ? "text-loss" : "text-profit"
                        }
                      >
                        {d.type === "deduction" ? "−" : ""}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(Math.abs(d.value))}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Invisible spacer lifts the visible bar */}
            <Bar dataKey="spacer" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            {/* Visible coloured bar */}
            <Bar dataKey="bar" stackId="waterfall" isAnimationActive={false} radius={[3, 3, 0, 0]}>
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
