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
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-profit animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Cash Distribution
        </h2>
      </div>

      <div className="flex-1 rounded-xl border border-dex-border bg-dex-bg/30 p-3 overflow-hidden">
        <div className="space-y-3">
          {data.map((row, idx) => {
            const isLast = idx === data.length - 1;
            const isNegative = row.amount < 0;
            const isIncome = !isNegative && idx === 0;

            const valueColor = isIncome
              ? "text-dex-tx"
              : isLast
              ? row.amount >= 0
                ? "text-profit"
                : "text-loss"
              : "text-loss";

            return (
              <div key={row.label}>
                {/* ── Two-line row: label / percent + value ── */}
                <div className={`rounded-lg px-3 py-2 ${isLast ? "bg-dex-border/20 border border-dex-border/50" : ""}`}>
                  {/* Label */}
                  <div className={`text-xs leading-tight mb-1.5 ${isLast ? "font-semibold text-dex-tx uppercase tracking-wider" : "text-dex-tx3"}`}>
                    {row.label}
                  </div>

                  {/* Percent badge + value — flex with min-w-0 so they never overflow */}
                  <div className="flex items-baseline justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-dex-tx3 shrink-0">
                      {row.percent_of_gross.toFixed(1)}%
                    </span>
                    <span className={`font-mono font-bold text-right break-all ${isLast ? "text-base" : "text-sm"} ${valueColor}`}>
                      {isNegative ? "−" : ""}{formatCurrency(row.amount)}
                    </span>
                  </div>
                </div>

                {/* Divider before last row */}
                {idx === data.length - 2 && (
                  <div className="my-2 border-t border-dex-border border-dashed" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
