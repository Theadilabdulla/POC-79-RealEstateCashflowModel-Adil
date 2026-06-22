"use client";

// ──────────────────────────────────────────────────────────────
// WhyThisMatters — Editorial context panel
// Core Rail: Capital Formation
// ──────────────────────────────────────────────────────────────

export function WhyThisMatters() {
  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 border-l-4 border-l-dex-cyan h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <h3 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-cyan">
          Why This Matters
        </h3>
      </div>

      {/* Content */}
      <div className="space-y-4 text-sm text-dex-tx2 leading-relaxed">
        <p>
          <span className="text-dex-tx font-semibold">Real estate is the largest asset class on Earth</span>{" "}
          — worth over $326 trillion globally. Yet most people interact with it only
          as tenants or homeowners, never seeing the financial engine underneath.
        </p>

        <p>
          This dashboard models the{" "}
          <span className="text-dex-cyan font-medium">Capital Formation rail</span>{" "}
          — the process by which rental income flows through a property entity,
          services debt obligations, covers operating costs, and ultimately
          distributes cash to equity holders.
        </p>

        <p>
          Understanding this flow is critical for:
        </p>

        <ul className="space-y-2 ml-1">
          <li className="flex items-start gap-2">
            <span className="text-dex-cyan mt-0.5">▸</span>
            <span>
              <span className="text-dex-tx font-medium">Everyday viewers</span> — See exactly
              where your rent dollar goes each month
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-dex-cyan mt-0.5">▸</span>
            <span>
              <span className="text-dex-tx font-medium">Builders & operators</span> — Stress-test
              assumptions before committing capital
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-dex-cyan mt-0.5">▸</span>
            <span>
              <span className="text-dex-tx font-medium">Allocators & LPs</span> — Evaluate risk-adjusted
              returns across property types and markets
            </span>
          </li>
        </ul>

        <div className="mt-4 pt-4 border-t border-dex-border">
          <p className="text-xs text-dex-tx3 italic">
            Data sources: FRED (Federal Reserve Economic Data) for market indicators.
            Synthetic property-level data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
