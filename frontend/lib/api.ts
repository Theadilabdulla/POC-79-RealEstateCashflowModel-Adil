// ──────────────────────────────────────────────────────────────
// POC 79 — Real Estate Cashflow Model
// API Utility — Typed fetch for POST /api/calculate
// ──────────────────────────────────────────────────────────────

import type { PropertyInput, CashflowResult, ApiErrorResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Sends property assumptions to the backend and returns computed
 * financial metrics. Throws a descriptive Error on failure.
 */
export async function calculateCashflow(
  input: PropertyInput
): Promise<CashflowResult> {
  const url = `${API_BASE_URL}/api/calculate`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch (networkError: unknown) {
    const message =
      networkError instanceof Error
        ? networkError.message
        : "Unknown network error";
    throw new Error(
      `Network error — could not reach the backend at ${url}. ${message}`
    );
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const errorBody: ApiErrorResponse = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // Response body was not JSON — keep the status code message
    }
    throw new Error(`API error: ${detail}`);
  }

  const data: CashflowResult = await response.json();
  return data;
}
