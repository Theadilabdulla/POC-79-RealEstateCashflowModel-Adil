"use client";

import { useState, useMemo } from "react";
import type { PropertySummary } from "@/types";

interface PropertySelectorProps {
  properties: PropertySummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const ALL = "All";

export function PropertySelector({
  properties,
  selectedId,
  onSelect,
  isLoading,
}: PropertySelectorProps) {
  const [metroFilter, setMetroFilter] = useState<string>(ALL);
  const [minCapRate, setMinCapRate] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  // Derive unique metro list from portfolio
  const metros = useMemo(
    () => [ALL, ...Array.from(new Set(properties.map((p) => p.metro))).sort()],
    [properties]
  );

  // Apply all filters
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchMetro = metroFilter === ALL || p.metro === metroFilter;
      const matchCap = p.cap_rate >= minCapRate;
      const matchSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.metro.toLowerCase().includes(search.toLowerCase());
      return matchMetro && matchCap && matchSearch;
    });
  }, [properties, metroFilter, minCapRate, search]);

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
      {/* Header + filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-dex-tx3">
          Portfolio — {filtered.length}/{properties.length} Properties
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name / metro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-dex-bg border border-dex-border rounded-lg px-3 py-1.5 text-xs font-mono text-dex-tx2 placeholder-dex-tx3 focus:outline-none focus:border-dex-cyan transition-colors w-44"
          />

          {/* Metro filter */}
          <select
            value={metroFilter}
            onChange={(e) => setMetroFilter(e.target.value)}
            className="bg-dex-bg border border-dex-border rounded-lg px-3 py-1.5 text-xs font-mono text-dex-tx2 focus:outline-none focus:border-dex-cyan transition-colors"
          >
            {metros.map((m) => (
              <option key={m} value={m}>
                {m === ALL ? "All Metros" : m}
              </option>
            ))}
          </select>

          {/* Min cap rate */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-dex-tx3 whitespace-nowrap">
              Min Cap&nbsp;
            </span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={minCapRate}
              onChange={(e) => setMinCapRate(parseFloat(e.target.value) || 0)}
              className="bg-dex-bg border border-dex-border rounded-lg px-2 py-1.5 text-xs font-mono text-dex-cyan w-16 focus:outline-none focus:border-dex-cyan transition-colors"
            />
            <span className="text-[10px] font-mono text-dex-tx3">%</span>
          </div>

          {/* Reset */}
          {(metroFilter !== ALL || minCapRate > 0 || search !== "") && (
            <button
              onClick={() => {
                setMetroFilter(ALL);
                setMinCapRate(0);
                setSearch("");
              }}
              className="text-[10px] font-mono uppercase text-dex-tx3 hover:text-dex-cyan border border-dex-border rounded-lg px-2 py-1.5 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Property grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-dex-tx3 text-xs font-mono">
          No properties match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((prop) => {
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
                    <h3
                      className={`font-semibold text-sm ${
                        isSelected ? "text-dex-tx" : "text-dex-tx2"
                      }`}
                    >
                      {prop.name}
                    </h3>
                    <p className="text-xs text-dex-tx3 font-mono mt-0.5">
                      {prop.metro}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-dex-cyan" />
                  )}
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-[10px] text-dex-tx3 uppercase tracking-wider mb-0.5">
                      Units
                    </div>
                    <div className="font-mono text-xs text-dex-tx2">
                      {prop.units}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-dex-tx3 uppercase tracking-wider mb-0.5">
                      Cap Rate
                    </div>
                    <div
                      className={`font-mono font-bold text-sm ${
                        isSelected ? "text-profit" : "text-dex-tx2"
                      }`}
                    >
                      {prop.cap_rate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
