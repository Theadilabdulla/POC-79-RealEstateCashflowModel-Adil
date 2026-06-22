"use client";

import type { CashflowResult } from "@/types";

// ──────────────────────────────────────────────────────────────
// Formatting helpers
// ──────────────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);
  return value < 0 ? `-${formatted}` : formatted;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// ──────────────────────────────────────────────────────────────
// Metric card config
// ──────────────────────────────────────────────────────────────
interface MetricCardConfig {
  key: keyof CashflowResult;
  label: string;
  format: "currency" | "percent";
  isHero: boolean;
  icon: string;
}

const METRIC_CARDS: MetricCardConfig[] = [
  {
    key: "cap_rate",
    label: "Cap Rate",
    format: "percent",
    isHero: true,
    icon: "◎",
  },
  {
    key: "cash_on_cash_return",
    label: "Cash-on-Cash Return",
    format: "percent",
    isHero: true,
    icon: "⟐",
  },
  {
    key: "monthly_cashflow",
    label: "Monthly Cashflow",
    format: "currency",
    isHero: false,
    icon: "↗",
  },
  {
    key: "net_operating_income_annual",
    label: "Net Operating Income (Annual)",
    format: "currency",
    isHero: false,
    icon: "Σ",
  },
  {
    key: "monthly_mortgage_payment",
    label: "Monthly Mortgage Payment",
    format: "currency",
    isHero: false,
    icon: "⌂",
  },
];

// ──────────────────────────────────────────────────────────────
// Component Props
// ──────────────────────────────────────────────────────────────
interface OutputPanelProps {
  result: CashflowResult | null;
  isLoading: boolean;
  error: string | null;
}

// ──────────────────────────────────────────────────────────────
// Skeleton Placeholder
// ──────────────────────────────────────────────────────────────
function SkeletonCard({ isHero }: { isHero: boolean }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${
        isHero ? "lg:col-span-1" : ""
      }`}
    >
      <div className="skeleton h-3 w-24 mb-4" />
      <div className={`skeleton ${isHero ? "h-10 w-36" : "h-8 w-28"} mb-2`} />
      <div className="skeleton h-3 w-16" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center col-span-full min-h-[320px]">
      <div className="text-5xl mb-4 opacity-30">📊</div>
      <h3 className="text-lg font-semibold text-dex-tx2 mb-2">
        No Results Yet
      </h3>
      <p className="text-sm text-dex-tx3 max-w-sm">
        Enter your property assumptions on the left and click{" "}
        <span className="text-dex-cyan font-medium">Calculate Cashflow</span>{" "}
        to generate your financial analysis.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Error State
// ──────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-loss/30 col-span-full animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div>
          <h3 className="text-sm font-semibold text-loss mb-1 uppercase tracking-wide">
            Calculation Error
          </h3>
          <p className="text-sm text-dex-tx2 leading-relaxed">{message}</p>
          <p className="text-xs text-dex-tx3 mt-2">
            Ensure the backend is running on port 8000 and try again.
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MetricCard
// ──────────────────────────────────────────────────────────────
function MetricCard({
  config,
  value,
  delay,
}: {
  config: MetricCardConfig;
  value: number;
  delay: number;
}) {
  const formattedValue =
    config.format === "currency" ? formatCurrency(value) : formatPercent(value);

  // Determine coloring: mortgage is always neutral, others are green/red based on sign
  const isMortgage = config.key === "monthly_mortgage_payment";
  const isPositive = value >= 0;
  const valueColor = isMortgage
    ? "text-dex-tx"
    : isPositive
    ? "text-profit"
    : "text-loss";
  const glowClass = isMortgage
    ? ""
    : isPositive
    ? "glow-profit"
    : "glow-loss";

  return (
    <div
      className={`glass-card rounded-2xl p-6 animate-slide-in opacity-0 ${
        config.isHero
          ? `${glowClass} border-opacity-20`
          : ""
      }`}
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base opacity-50">{config.icon}</span>
        <span className="text-xs font-medium text-dex-tx3 uppercase tracking-wider">
          {config.label}
        </span>
      </div>

      {/* Value */}
      <div
        className={`font-mono font-bold ${valueColor} ${
          config.isHero ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl"
        }`}
      >
        {formattedValue}
      </div>

      {/* Subtitle hint */}
      {config.isHero && (
        <div className="mt-2 text-xs text-dex-tx3">
          {config.key === "cap_rate"
            ? "NOI ÷ Purchase Price"
            : "Annual Cashflow ÷ Down Payment"}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// OutputPanel Component
// ──────────────────────────────────────────────────────────────
export function OutputPanel({ result, isLoading, error }: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-indigo animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Financial Analysis
        </h2>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState message={error} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {METRIC_CARDS.map((card) => (
            <SkeletonCard key={card.key} isHero={card.isHero} />
          ))}
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {METRIC_CARDS.map((card, index) => (
            <MetricCard
              key={card.key}
              config={card}
              value={result[card.key]}
              delay={index}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
