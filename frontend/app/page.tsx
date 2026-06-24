"use client";

import { useState, useEffect } from "react";
import { 
  fetchPortfolio, 
  fetchPropertyDetail, 
  fetchNOIBridge, 
  fetchDebtService, 
  fetchCashDistribution,
  fetchMarketData,
  runScenario,
  getDownloadUrl
} from "@/lib/api";
import type { 
  PropertySummary, 
  PropertyDetail, 
  NOIBridgeItem, 
  DebtServiceResponse, 
  CashDistributionRow,
  MarketData,
  ScenarioInput
} from "@/types";

import { PropertySelector } from "@/components/PropertySelector";
import { MarketIndicators } from "@/components/MarketIndicators";
import { NOIBridge } from "@/components/NOIBridge";
import { DebtService } from "@/components/DebtService";
import { ScenarioToggles } from "@/components/ScenarioToggles";
import { CashDistribution } from "@/components/CashDistribution";
import { LeaseRollTable } from "@/components/LeaseRollTable";
import { WhyThisMatters } from "@/components/WhyThisMatters";
import { WhoControlsTheRail } from "@/components/WhoControlsTheRail";
import { OutputPanel } from "@/components/OutputPanel";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PropertySummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [noiBridge, setNoiBridge] = useState<NOIBridgeItem[]>([]);
  const [debtService, setDebtService] = useState<DebtServiceResponse | null>(null);
  const [cashDistribution, setCashDistribution] = useState<CashDistributionRow[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load portfolio and market data on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const [portfolioData, market] = await Promise.all([
          fetchPortfolio(),
          fetchMarketData()
        ]);
        setPortfolio(portfolioData);
        setMarketData(market);
        
        if (portfolioData.length > 0) {
          handleSelectProperty(portfolioData[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load initial data");
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const handleSelectProperty = async (id: string) => {
    setIsLoading(true);
    setSelectedId(id);
    setError(null);
    try {
      const [detail, bridge, debt, cash] = await Promise.all([
        fetchPropertyDetail(id),
        fetchNOIBridge(id),
        fetchDebtService(id),
        fetchCashDistribution(id)
      ]);
      setPropertyDetail(detail);
      setNoiBridge(bridge);
      setDebtService(debt);
      setCashDistribution(cash);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load property data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyScenario = async (scenario: ScenarioInput) => {
    if (!selectedId) return;
    setIsScenarioLoading(true);
    try {
      // Re-fetch detail under scenario
      const detail = await runScenario(selectedId, scenario);
      setPropertyDetail(detail);
      
      // Note: for a fully reactive dashboard, we would also need scenario endpoints for the bridge/debt/cash
      // but for this MVP, updating the detail view shows the core metrics change.
      // We can just rely on the updated propertyDetail for the top-line changes.
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to run scenario");
    } finally {
      setIsScenarioLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dex-bg flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="glass border-b border-dex-border sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-dex-cyan animate-pulse-glow" />
            <h1 className="font-mono font-bold text-sm tracking-widest uppercase text-dex-tx">
              Real Estate Cashflow Model
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-dex-tx3">
            <span>POC&nbsp;<span className="text-dex-cyan font-semibold">79</span></span>
            <span className="w-px h-4 bg-dex-border" />
            <span>SYSTEM&nbsp;<span className="text-profit font-semibold">ONLINE</span></span>
          </div>
        </div>
      </header>

      {/* ─── Body: strict 70 / 30 split ─── */}
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">

        {/* ═══ LEFT — Main Content (70%) ═══ */}
        <main className="flex-[7] min-w-0 px-4 sm:px-6 py-6 lg:py-8 flex flex-col gap-6">
          {error && (
            <div className="bg-loss/10 border border-loss text-loss p-4 rounded-xl font-mono text-sm">
              Error: {error}
            </div>
          )}

          {/* Market ticker */}
          <MarketIndicators data={marketData} />

          {/* Property selector */}
          <PropertySelector
            properties={portfolio}
            selectedId={selectedId}
            onSelect={handleSelectProperty}
            isLoading={portfolio.length === 0}
          />

          {!isLoading && propertyDetail && (
            <div className="flex flex-col gap-6">

              {/* KPI strip */}
              <OutputPanel
                result={{
                  net_operating_income_annual: propertyDetail.noi,
                  monthly_mortgage_payment: propertyDetail.monthly_mortgage,
                  monthly_cashflow: propertyDetail.monthly_cashflow,
                  cap_rate: propertyDetail.cap_rate,
                  cash_on_cash_return: propertyDetail.cash_on_cash,
                }}
                isLoading={isScenarioLoading}
                error={null}
              />

              {/* NOI Bridge + Cash Distribution side-by-side */}
              <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                <div className="xl:col-span-7">
                  <NOIBridge data={noiBridge} />
                </div>
                <div className="xl:col-span-3">
                  <CashDistribution data={cashDistribution} />
                </div>
              </div>

              {/* Debt Service */}
              <DebtService data={debtService} />

              {/* Lease Roll */}
              <LeaseRollTable data={propertyDetail.lease_roll} />
            </div>
          )}
        </main>

        {/* ═══ RIGHT — Sidebar (30%) ═══ */}
        <aside
          className="flex-[3] min-w-[280px] max-w-[420px] sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-5 px-4 py-6"
          style={{
            backgroundColor: "var(--dna-surface)",
            borderLeft: "1px solid rgba(129,140,248,0.25)",
          }}
        >
          {/* Indigo accent line */}
          <div
            className="h-0.5 w-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--dna-indigo) 0%, transparent 100%)" }}
          />

          {/* Sidebar header */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse-glow"
              style={{ backgroundColor: "var(--dna-indigo)" }}
            />
            <span
              className="text-xs font-mono font-semibold tracking-widest uppercase"
              style={{ color: "var(--dna-indigo)" }}
            >
              Controls & Insights
            </span>
          </div>

          {/* Scenario Analysis */}
          <ScenarioToggles onApply={handleApplyScenario} isLoading={isScenarioLoading} />

          {/* Why This Matters */}
          <WhyThisMatters />

          {/* Who Controls the Rail */}
          <WhoControlsTheRail />
        </aside>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-dex-border py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-mono text-dex-tx3">
          <span>Intelligence Library</span>
          <div className="flex gap-4 items-center">
            <a href={getDownloadUrl()} target="_blank" rel="noreferrer" className="text-dex-cyan hover:underline flex items-center gap-1">
              <span>📥</span> Download Sample Data (CSV)
            </a>
            <span className="w-px h-4 bg-dex-border" />
            <span>Backend <span className="text-dex-cyan">127.0.0.1:8000</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}