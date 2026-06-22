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
      } catch (err: any) {
        setError(err.message || "Failed to load initial data");
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
    } catch (err: any) {
      setError(err.message || "Failed to load property data");
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
    } catch (err: any) {
      setError(err.message || "Failed to run scenario");
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

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {error && (
          <div className="bg-loss/10 border border-loss text-loss p-4 rounded-xl mb-8 font-mono text-sm">
            Error: {error}
          </div>
        )}

        <MarketIndicators data={marketData} />
        
        <PropertySelector 
          properties={portfolio} 
          selectedId={selectedId} 
          onSelect={handleSelectProperty} 
          isLoading={portfolio.length === 0} 
        />

        {!isLoading && propertyDetail && (
          <div className="flex flex-col gap-6 lg:gap-8">
            
            {/* Row 1: KPI Output Panel (using existing component adapted for PropertyDetail format) */}
            <div className="w-full">
              <OutputPanel 
                result={{
                  net_operating_income_annual: propertyDetail.noi,
                  monthly_mortgage_payment: propertyDetail.monthly_mortgage,
                  monthly_cashflow: propertyDetail.monthly_cashflow,
                  cap_rate: propertyDetail.cap_rate,
                  cash_on_cash_return: propertyDetail.cash_on_cash
                }} 
                isLoading={isScenarioLoading} 
                error={null} 
              />
            </div>

            {/* Row 2: Scenario + Bridge + Cash Dist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-3">
                <ScenarioToggles onApply={handleApplyScenario} isLoading={isScenarioLoading} />
              </div>
              <div className="lg:col-span-5">
                <NOIBridge data={noiBridge} />
              </div>
              <div className="lg:col-span-4">
                <CashDistribution data={cashDistribution} />
              </div>
            </div>

            {/* Row 3: Debt + Editorial */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-6">
                <DebtService data={debtService} />
              </div>
              <div className="lg:col-span-3">
                <WhyThisMatters />
              </div>
              <div className="lg:col-span-3">
                <WhoControlsTheRail />
              </div>
            </div>

            {/* Row 4: Lease Roll */}
            <div className="w-full">
              <LeaseRollTable data={propertyDetail.lease_roll} />
            </div>

          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-dex-border py-6 mt-8">
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