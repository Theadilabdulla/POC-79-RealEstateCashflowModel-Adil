"use client";

import type { CashDistributionRow } from "@/types";

export function CashDistribution({ data }: { data: CashDistributionRow[] | null }) {
  if (!data || data.length === 0) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.abs(val));

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-profit animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Cash Distribution
        </h2>
      </div>

      <div className="flex-1 rounded-xl border border-dex-border bg-dex-bg/30 p-4">
        <div className="space-y-4">
          {data.map((row, idx) => {
            const isLast = idx === data.length - 1;
            const isNegative = row.amount < 0;
            const isIncome = !isNegative && idx === 0; // First row is NOI

            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className={`text-sm min-w-0 flex-1 break-words ${isLast ? "font-semibold text-dex-tx uppercase tracking-wider" : "text-dex-tx2"}`}>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="text-[10px] font-mono text-dex-tx3 w-10 sm:w-12 text-right">
                      {row.percent_of_gross.toFixed(1)}%
                    </span>
                    <span className={`font-mono text-sm font-semibold w-24 sm:w-28 text-right whitespace-nowrap ${
                      isIncome ? "text-dex-tx" : isLast ? (row.amount >= 0 ? "text-profit glow-profit" : "text-loss glow-loss") : "text-loss"
                    }`}>
                      {isNegative ? "-" : ""}{formatCurrency(row.amount)}
                    </span>
                  </div>
                </div>

                {!isLast && idx < data.length - 2 && (
                  <div className="flex justify-end mt-2 mb-2">
                    <div className="w-24 h-px bg-dex-border/50" />
                  </div>
                )}
                
                {idx === data.length - 2 && (
                  <div className="my-3 border-t border-dex-border border-dashed" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
