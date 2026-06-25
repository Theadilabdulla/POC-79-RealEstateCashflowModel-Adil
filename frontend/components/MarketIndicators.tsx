"use client";

import type { MarketData } from "@/types";

export function MarketIndicators({ data }: { data: MarketData | null }) {
  if (!data) return null;

  const indicators = [
    {
      label: "30-Yr Mortgage",
      value: `${data.mortgage_rate.toFixed(2)}%`,
      icon: "🏦",
      source: "FRED · MORTGAGE30US",
      sourceType: "live" as const,
    },
    {
      label: "Median Sale Price",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(data.median_sale_price),
      icon: "🏠",
      source: "FRED · MSPUS",
      sourceType: "live" as const,
    },
    {
      label: "CPI Index",
      value: data.cpi.toFixed(1),
      icon: "📈",
      source: "FRED · CPIAUCSL",
      sourceType: "live" as const,
    },
    {
      label: "Rental Vacancy",
      value: `${data.vacancy_rate.toFixed(1)}%`,
      icon: "🔑",
      source: "FRED · RRVRUSQ156N",
      sourceType: "live" as const,
    },
    {
      label: "Avg Metro Rent",
      value: "$1,782",
      icon: "🏘️",
      source: "Zillow ZORI · SIMULATED",
      sourceType: "simulated" as const,
    },
    {
      label: "Rent YoY Change",
      value: "+3.3%",
      icon: "📊",
      source: "Zillow Research · SIMULATED",
      sourceType: "simulated" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-dex-tx3">
          Macro Indicators
        </h2>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-dex-cyan animate-pulse-glow" />
            <span className="text-dex-cyan uppercase">
              FRED {data.source === "live" ? "Live" : "Cached"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400 uppercase">Zillow Simulated</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {indicators.map((ind) => (
          <div
            key={ind.label}
            className="glass-card rounded-xl p-3 flex flex-col gap-1"
          >
            <div className="flex items-start justify-between">
              <span className="text-xl">{ind.icon}</span>
              <span
                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                  ind.sourceType === "simulated"
                    ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                    : "text-dex-cyan border-dex-cyan/30 bg-dex-cyan/10"
                }`}
              >
                {ind.sourceType === "simulated" ? "SIM" : "LIVE"}
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-dex-tx3 font-semibold">
              {ind.label}
            </div>
            <div className="text-sm font-mono font-bold text-dex-tx2">
              {ind.value}
            </div>
            <div className="text-[9px] font-mono text-dex-tx3 opacity-70 truncate">
              {ind.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
