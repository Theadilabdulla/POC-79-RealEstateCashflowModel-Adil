"use client";

// ──────────────────────────────────────────────────────────────
// WhoControlsTheRail — Capital formation flow diagram
// Shows the chain: Tenant → Property Manager → Sponsor → Lender → LP
// ──────────────────────────────────────────────────────────────

interface RailNode {
  role: string;
  icon: string;
  cashflowShare: string;
  description: string;
  color: string;
}

const RAIL_NODES: RailNode[] = [
  {
    role: "Tenants",
    icon: "🏠",
    cashflowShare: "100%",
    description: "Source of all revenue — pay monthly rent that feeds the entire capital stack",
    color: "text-dex-cyan",
  },
  {
    role: "Property Manager",
    icon: "🔧",
    cashflowShare: "6–10%",
    description: "Handles day-to-day operations, tenant relations, maintenance, and leasing",
    color: "text-dex-tx2",
  },
  {
    role: "Operating Expenses",
    icon: "📋",
    cashflowShare: "30–45%",
    description: "Property tax, insurance, utilities, maintenance, and reserves for capital expenditures",
    color: "text-loss",
  },
  {
    role: "Lender / Debt Service",
    icon: "🏦",
    cashflowShare: "25–40%",
    description: "Senior secured position — mortgage principal and interest payments take priority",
    color: "text-amber-400",
  },
  {
    role: "Sponsor / GP",
    icon: "👤",
    cashflowShare: "1–3%",
    description: "General Partner — earns asset management fee and carried interest above hurdle",
    color: "text-dex-indigo",
  },
  {
    role: "LP Investors / Equity",
    icon: "💰",
    cashflowShare: "10–25%",
    description: "Limited Partners — receive remaining net cash flow as return on invested equity",
    color: "text-profit",
  },
];

export function WhoControlsTheRail() {
  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 border-l-4 border-l-dex-indigo h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">⛓️</span>
        <h3 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-indigo">
          Who Controls the Rail
        </h3>
      </div>

      {/* Flow Diagram */}
      <div className="space-y-1">
        {RAIL_NODES.map((node, index) => (
          <div key={node.role}>
            {/* Node */}
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-dex-bg/40 transition-colors group">
              {/* Icon + Connector */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-lg bg-dex-bg/60 border border-dex-border flex items-center justify-center text-base group-hover:border-dex-cyan/30 transition-colors">
                  {node.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-sm font-semibold ${node.color}`}>
                    {node.role}
                  </span>
                  <span className="text-xs font-mono text-dex-tx3 shrink-0">
                    {node.cashflowShare}
                  </span>
                </div>
                <p className="text-xs text-dex-tx3 leading-relaxed">
                  {node.description}
                </p>
              </div>
            </div>

            {/* Arrow connector */}
            {index < RAIL_NODES.length - 1 && (
              <div className="flex justify-start ml-[18px]">
                <div className="w-px h-3 bg-dex-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer insight */}
      <div className="mt-4 pt-4 border-t border-dex-border">
        <p className="text-xs text-dex-tx3 italic">
          The capital stack is a waterfall — each layer gets paid in order of seniority.
          Equity takes the most risk but captures the upside.
        </p>
      </div>
    </div>
  );
}
