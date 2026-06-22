"use client";

import type { PropertySummary } from "@/types";

interface PropertySelectorProps {
  properties: PropertySummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function PropertySelector({ properties, selectedId, onSelect, isLoading }: PropertySelectorProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="skeleton h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-dex-tx3 mb-3">
        Select Property Portfolio
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((prop) => {
          const isSelected = prop.id === selectedId;
          
          return (
            <button
              key={prop.id}
              onClick={() => onSelect(prop.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "bg-dex-surface/80 border-dex-cyan shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                  : "bg-dex-bg/60 border-dex-border hover:border-dex-tx3 hover:bg-dex-surface/40"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`font-semibold text-sm ${isSelected ? "text-dex-tx" : "text-dex-tx2"}`}>
                    {prop.name}
                  </h3>
                  <p className="text-xs text-dex-tx3 font-mono mt-0.5">{prop.metro}</p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-dex-cyan" />
                )}
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <div className="text-[10px] text-dex-tx3 uppercase tracking-wider mb-0.5">Units</div>
                  <div className="font-mono text-xs text-dex-tx2">{prop.units}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-dex-tx3 uppercase tracking-wider mb-0.5">Cap Rate</div>
                  <div className={`font-mono font-bold text-sm ${isSelected ? "text-profit" : "text-dex-tx2"}`}>
                    {prop.cap_rate.toFixed(2)}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
