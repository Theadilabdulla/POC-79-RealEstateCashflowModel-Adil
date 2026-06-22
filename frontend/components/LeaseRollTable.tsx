"use client";

import type { LeaseEntry } from "@/types";

export function LeaseRollTable({ data }: { data: LeaseEntry[] | null }) {
  if (!data || data.length === 0) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-profit bg-profit/10 border-profit/20";
      case "Expiring Soon": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "Vacant": return "text-loss bg-loss/10 border-loss/20";
      default: return "text-dex-tx3 bg-dex-bg border-dex-border";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-tx animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Lease Roll Details
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-dex-border bg-dex-bg/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dex-border bg-dex-surface/50 text-[10px] uppercase tracking-wider text-dex-tx3 font-mono">
              <th className="p-4 font-semibold">Unit</th>
              <th className="p-4 font-semibold">Tenant</th>
              <th className="p-4 font-semibold text-right">Rent</th>
              <th className="p-4 font-semibold">Lease Start</th>
              <th className="p-4 font-semibold">Lease End</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono text-dex-tx2">
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-dex-border/50 hover:bg-dex-surface/30 transition-colors">
                <td className="p-4 font-bold text-dex-tx">{row.unit_number}</td>
                <td className="p-4">{row.tenant_name || "—"}</td>
                <td className="p-4 text-right font-semibold text-dex-cyan">{formatCurrency(row.monthly_rent)}</td>
                <td className="p-4 text-dex-tx3">{row.lease_start ? new Date(row.lease_start).toLocaleDateString() : "—"}</td>
                <td className="p-4 text-dex-tx3">{row.lease_end ? new Date(row.lease_end).toLocaleDateString() : "—"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md border text-[10px] uppercase tracking-wider font-semibold ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
