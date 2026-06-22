// ─── Property Input & Cashflow Result (existing) ────────────────────────────

export interface PropertyInput {
  purchase_price: number;
  down_payment_percent: number;
  interest_rate: number;
  gross_monthly_rent: number;
  monthly_operating_expenses: number;
}

export interface CashflowResult {
  net_operating_income_annual: number;
  monthly_mortgage_payment: number;
  monthly_cashflow: number;
  cap_rate: number;
  cash_on_cash_return: number;
}

export interface ApiErrorResponse {
  detail: string;
}

// ─── Portfolio & Property Summary ────────────────────────────────────────────

export interface PropertySummary {
  id: string;
  name: string;
  metro: string;
  units: number;
  purchase_price: number;
  cap_rate: number;
  cash_on_cash: number;
  monthly_cashflow: number;
}

// ─── Lease Roll ──────────────────────────────────────────────────────────────

export interface LeaseEntry {
  unit_number: string;
  tenant_name: string;
  monthly_rent: number;
  lease_start: string;
  lease_end: string;
  status: "Active" | "Expiring Soon" | "Vacant";
}

// ─── Expense Breakdown ──────────────────────────────────────────────────────

export interface ExpenseBreakdown {
  property_tax: number;
  insurance: number;
  maintenance: number;
  management: number;
  utilities: number;
  reserves: number;
  total: number;
}

// ─── Property Detail ────────────────────────────────────────────────────────

export interface PropertyDetail {
  id: string;
  name: string;
  metro: string;
  address: string;
  units: number;
  year_built: number;
  property_type: string;
  purchase_price: number;
  current_value: number;
  down_payment_percent: number;
  interest_rate: number;
  loan_term_years: number;
  vacancy_rate: number;
  cap_rate: number;
  cash_on_cash: number;
  monthly_cashflow: number;
  noi_annual: number;
  monthly_mortgage: number;
  dscr: number;
  lease_roll: LeaseEntry[];
  expenses: ExpenseBreakdown;
}

// ─── NOI Bridge (Waterfall) ─────────────────────────────────────────────────

export interface NOIBridgeItem {
  label: string;
  value: number;
  type: "income" | "deduction" | "subtotal";
}

// ─── Debt Service Schedule ──────────────────────────────────────────────────

export interface DebtScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface DebtServiceResponse {
  schedule: DebtScheduleRow[];
  dscr: number;
  total_annual_service: number;
}

// ─── Cash Distribution Waterfall ────────────────────────────────────────────

export interface CashDistributionRow {
  label: string;
  amount: number;
  percent_of_gross: number;
  running_total: number;
}

// ─── Scenario Analysis ─────────────────────────────────────────────────────

export interface ScenarioInput {
  vacancy_rate_override: number | null;
  interest_rate_override: number | null;
  rent_growth_percent: number | null;
}

// ─── Market Data ────────────────────────────────────────────────────────────

export interface MarketData {
  mortgage_rate: number;
  median_sale_price: number;
  cpi: number;
  vacancy_rate: number;
  source: "live" | "cached";
}
