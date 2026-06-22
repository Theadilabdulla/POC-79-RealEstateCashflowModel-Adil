// ──────────────────────────────────────────────────────────────
// POC 79 — Real Estate Cashflow Model
// TypeScript Interfaces (mirrors FastAPI Pydantic models)
// ──────────────────────────────────────────────────────────────

/**
 * Input payload sent to POST /api/calculate.
 * All monetary values are in USD. Percentages are whole numbers (e.g. 20 = 20%).
 */
export interface PropertyInput {
  purchase_price: number;
  down_payment_percent: number;
  interest_rate: number;
  gross_monthly_rent: number;
  monthly_operating_expenses: number;
}

/**
 * Computed financial metrics returned by the backend.
 * Monetary values are in USD. Rates are percentages.
 */
export interface CashflowResult {
  net_operating_income_annual: number;
  monthly_mortgage_payment: number;
  monthly_cashflow: number;
  cap_rate: number;
  cash_on_cash_return: number;
}

/**
 * Structured error response from the API.
 */
export interface ApiErrorResponse {
  detail: string;
}
