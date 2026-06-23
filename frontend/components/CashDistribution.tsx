"use client";

import type { CashDistributionRow } from "@/types";
import React from "react";

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
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center">
          {data.map((row, idx) => {
            const isLast = idx === data.length - 1;
            const isNegative = row.amount < 0;
            const isIncome = !isNegative && idx === 0; // First row is NOI

            return (
              <React.Fragment key={row.label}>
                <div className={`text-sm py-1.5 pr-2 ${isLast ? "font-semibold text-dex-tx uppercase tracking-wider" : "text-dex-tx2"}`}>
                  {row.label}
                </div>
                
                <div className="text-[10px] font-mono text-dex-tx3 text-right py-1.5">
                  {row.percent_of_gross.toFixed(1)}%
                </div>
                
                <div className={`font-mono text-sm font-semibold text-right whitespace-nowrap py-1.5 ${
                  isIncome ? "text-dex-tx" : isLast ? (row.amount >= 0 ? "text-profit glow-profit" : "text-loss glow-loss") : "text-loss"
                }`}>
                  {isNegative ? "-" : ""}{formatCurrency(row.amount)}
                </div>

                {!isLast && idx < data.length - 2 && (
                  <div className="col-span-3 flex justify-end">
                    <div className="w-24 h-px bg-dex-border/50 my-1" />
                  </div>
                )}
                
                {idx === data.length - 2 && (
                  <div className="col-span-3">
                    <div className="my-2 border-t border-dex-border border-dashed" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
