"use client";

import type { DebtServiceResponse } from "@/types";

export function DebtService({ data }: { data: DebtServiceResponse | null }) {
  if (!data || !data.schedule) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse-glow" />
          <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
            Debt Service Schedule
          </h2>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-dex-tx3 uppercase tracking-wider block text-[10px] mb-0.5">DSCR</span>
            <span className={`font-bold ${data.dscr >= 1.25 ? "text-profit" : data.dscr >= 1.0 ? "text-amber-400" : "text-loss"}`}>
              {data.dscr.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-dex-border bg-dex-bg/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dex-border bg-dex-surface/50 text-[10px] uppercase tracking-wider text-dex-tx3 font-mono">
              <th className="p-3 font-semibold">Mo</th>
              <th className="p-3 font-semibold text-right">Payment</th>
              <th className="p-3 font-semibold text-right">Principal</th>
              <th className="p-3 font-semibold text-right">Interest</th>
              <th className="p-3 font-semibold text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-dex-tx2">
            {data.schedule.slice(0, 12).map((row) => (
              <tr key={row.month} className="border-b border-dex-border/50 hover:bg-dex-surface/30 transition-colors">
                <td className="p-3 text-dex-tx3">{row.month}</td>
                <td className="p-3 text-right font-semibold text-dex-tx">{formatCurrency(row.payment)}</td>
                <td className="p-3 text-right">{formatCurrency(row.principal)}</td>
                <td className="p-3 text-right text-loss opacity-80">{formatCurrency(row.interest)}</td>
                <td className="p-3 text-right text-dex-tx3">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
