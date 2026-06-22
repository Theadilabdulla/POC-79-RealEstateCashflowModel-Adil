"use client";

import { useState } from "react";
import type { ScenarioInput } from "@/types";

interface ScenarioTogglesProps {
  onApply: (scenario: ScenarioInput) => void;
  isLoading: boolean;
}

export function ScenarioToggles({ onApply, isLoading }: ScenarioTogglesProps) {
  const [vacancy, setVacancy] = useState<number>(5);
  const [interest, setInterest] = useState<number>(6.5);
  const [rentGrowth, setRentGrowth] = useState<number>(0);

  const handleApply = () => {
    onApply({
      vacancy_rate_override: vacancy,
      interest_rate_override: interest,
      rent_growth_percent: rentGrowth,
    });
  };

  const handleReset = () => {
    onApply({
      vacancy_rate_override: null,
      interest_rate_override: null,
      rent_growth_percent: null,
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-indigo animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Scenario Analysis
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase text-dex-tx3">Vacancy Rate Override</label>
            <span className="text-xs font-mono font-bold text-dex-cyan">{vacancy}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="20" step="0.5" 
            value={vacancy} 
            onChange={(e) => setVacancy(parseFloat(e.target.value))}
            className="w-full accent-dex-cyan bg-dex-border h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase text-dex-tx3">Interest Rate Override</label>
            <span className="text-xs font-mono font-bold text-dex-cyan">{interest}%</span>
          </div>
          <input 
            type="range" 
            min="3" max="10" step="0.125" 
            value={interest} 
            onChange={(e) => setInterest(parseFloat(e.target.value))}
            className="w-full accent-dex-cyan bg-dex-border h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-mono uppercase text-dex-tx3">Rent Growth Stress</label>
            <span className={`text-xs font-mono font-bold ${rentGrowth >= 0 ? "text-profit" : "text-loss"}`}>
              {rentGrowth > 0 ? "+" : ""}{rentGrowth}%
            </span>
          </div>
          <input 
            type="range" 
            min="-10" max="15" step="1" 
            value={rentGrowth} 
            onChange={(e) => setRentGrowth(parseFloat(e.target.value))}
            className="w-full accent-dex-indigo bg-dex-border h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl border border-dex-border text-dex-tx3 text-xs font-semibold uppercase tracking-wider hover:bg-dex-surface/50 transition-colors disabled:opacity-50"
        >
          Base Case
        </button>
        <button 
          onClick={handleApply}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-dex-cyan/10 text-dex-cyan border border-dex-cyan/30 text-xs font-semibold uppercase tracking-wider hover:bg-dex-cyan hover:text-dex-bg transition-colors disabled:opacity-50"
        >
          {isLoading ? "Running..." : "Run Scenario"}
        </button>
      </div>
    </div>
  );
}
