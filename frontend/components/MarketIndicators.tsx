"use client";

import type { MarketData } from "@/types";

export function MarketIndicators({ data }: { data: MarketData | null }) {
  if (!data) return null;

  const indicators = [
    {
      label: "30-Yr Mortgage",
      value: `${data.mortgage_rate.toFixed(2)}%`,
      icon: "🏦",
    },
    {
      label: "Median Sale Price",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(data.median_sale_price),
      icon: "🏠",
    },
    {
      label: "CPI Index",
      value: data.cpi.toFixed(1),
      icon: "📈",
    },
    {
      label: "Rental Vacancy",
      value: `${data.vacancy_rate.toFixed(1)}%`,
      icon: "🔑",
    },
  ];

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-dex-tx3">
          Macro Indicators (FRED)
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          {data.source === "live" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-dex-cyan animate-pulse-glow" />
              <span className="text-dex-cyan uppercase">Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-dex-tx3" />
              <span className="text-dex-tx3 uppercase">Cached</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind) => (
          <div key={ind.label} className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl opacity-80">{ind.icon}</div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-dex-tx3 font-semibold mb-0.5">
                {ind.label}
              </div>
              <div className="text-sm font-mono font-bold text-dex-tx2">
                {ind.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
