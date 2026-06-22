"use client";

import { useState } from "react";
import type { PropertyInput, CashflowResult } from "@/types";
import { calculateCashflow } from "@/lib/api";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";

// ──────────────────────────────────────────────────────────────
// Default property assumptions — pre-populated so the user
// never starts with a blank screen
// ──────────────────────────────────────────────────────────────
const DEFAULT_INPUT: PropertyInput = {
  purchase_price: 300000,
  down_payment_percent: 20,
  interest_rate: 6.5,
  gross_monthly_rent: 2500,
  monthly_operating_expenses: 800,
};

// ──────────────────────────────────────────────────────────────
// Dashboard Page
// ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [input, setInput] = useState<PropertyInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<CashflowResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (
    field: keyof PropertyInput,
    value: number
  ): void => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await calculateCashflow(input);
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-bg flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="glass border-b border-dex-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-dex-cyan animate-pulse-glow" />
            <h1 className="font-mono font-bold text-sm tracking-widest uppercase text-dex-tx">
              Real Estate Cashflow Model
            </h1>
          </div>

          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-dex-tx3">
            <span>
              POC&nbsp;
              <span className="text-dex-cyan font-semibold">79</span>
            </span>
            <span className="w-px h-4 bg-dex-border" />
            <span>
              SYSTEM&nbsp;
              <span className="text-profit font-semibold">ONLINE</span>
            </span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full">
          {/* Input Panel — Left (4 columns on large screens) */}
          <div className="lg:col-span-4">
            <InputPanel
              values={input}
              onChange={handleFieldChange}
              onSubmit={handleCalculate}
              isLoading={isLoading}
            />
          </div>

          {/* Output Panel — Right (8 columns on large screens) */}
          <div className="lg:col-span-8">
            <OutputPanel
              result={result}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-dex-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-mono text-dex-tx3">
          <span>Intelligence Library</span>
          <span>
            Backend{" "}
            <span className="text-dex-cyan">127.0.0.1:8000</span>
          </span>
        </div>
      </footer>
    </div>
  );
}