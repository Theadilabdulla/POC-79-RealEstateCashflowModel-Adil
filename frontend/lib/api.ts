import type {
  PropertyInput,
  CashflowResult,
  PropertySummary,
  PropertyDetail,
  NOIBridgeItem,
  DebtServiceResponse,
  CashDistributionRow,
  ScenarioInput,
  MarketData,
  ApiErrorResponse,
} from "@/types";

// ─── Base URL ───────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// ─── Generic Fetch Wrapper ──────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> | undefined),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;

    try {
      const errorBody: ApiErrorResponse = await response.json();
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // response body was not JSON — keep the default message
    }

    throw new Error(message);
  }

  const data: T = await response.json();
  return data;
}

// ─── Cashflow Calculator (existing) ─────────────────────────────────────────

export async function calculateCashflow(
  input: PropertyInput
): Promise<CashflowResult> {
  return apiFetch<CashflowResult>("/calculate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ─── Portfolio ──────────────────────────────────────────────────────────────

export async function fetchPortfolio(): Promise<PropertySummary[]> {
  return apiFetch<PropertySummary[]>("/portfolio");
}

// ─── Property Detail ────────────────────────────────────────────────────────

export async function fetchPropertyDetail(
  id: string
): Promise<PropertyDetail> {
  return apiFetch<PropertyDetail>(`/portfolio/${encodeURIComponent(id)}`);
}

// ─── NOI Bridge (Waterfall) ─────────────────────────────────────────────────

export async function fetchNOIBridge(id: string): Promise<NOIBridgeItem[]> {
  return apiFetch<NOIBridgeItem[]>(
    `/portfolio/${encodeURIComponent(id)}/noi-bridge`
  );
}

// ─── Debt Service Schedule ──────────────────────────────────────────────────

export async function fetchDebtService(
  id: string
): Promise<DebtServiceResponse> {
  return apiFetch<DebtServiceResponse>(
    `/portfolio/${encodeURIComponent(id)}/debt-service`
  );
}

// ─── Cash Distribution Waterfall ────────────────────────────────────────────

export async function fetchCashDistribution(
  id: string
): Promise<CashDistributionRow[]> {
  return apiFetch<CashDistributionRow[]>(
    `/portfolio/${encodeURIComponent(id)}/cash-distribution`
  );
}

// ─── Scenario Analysis ─────────────────────────────────────────────────────

export async function runScenario(
  id: string,
  scenario: ScenarioInput
): Promise<PropertyDetail> {
  return apiFetch<PropertyDetail>(
    `/portfolio/${encodeURIComponent(id)}/scenario`,
    {
      method: "POST",
      body: JSON.stringify(scenario),
    }
  );
}

// ─── Market Data ────────────────────────────────────────────────────────────

export async function fetchMarketData(): Promise<MarketData> {
  return apiFetch<MarketData>("/market-data");
}

// ─── CSV Download URL ───────────────────────────────────────────────────────

export function getDownloadUrl(): string {
  return `${API_BASE_URL}/portfolio/download`;
}
