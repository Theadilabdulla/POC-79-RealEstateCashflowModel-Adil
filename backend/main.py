"""
Real Estate Cashflow Model — FastAPI Backend
=============================================
A comprehensive API for analyzing multifamily real-estate investments.

Features:
  - Synthetic portfolio of 8 multifamily properties (deterministic via seed 42)
  - FRED API integration for live macro / mortgage data
  - NOI bridge, debt-service schedule, cash-distribution waterfall
  - Scenario analysis with vacancy / rate / rent-growth overrides
  - CSV export of portfolio summary
"""

from __future__ import annotations

import csv
import io
import logging
import math
import os
import random
from datetime import date, timedelta
from enum import Enum
from typing import List, Literal, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cashflow_api")

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Real Estate Cashflow Model API",
    version="2.0.0",
    description="Backend for the Real Estate Cashflow dashboard – portfolio analytics, "
    "NOI waterfall, debt service, scenario analysis, and FRED market data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 1. SYNTHETIC DATA GENERATOR
# ============================================================================

# Fixed seed for reproducibility
random.seed(42)

# Name pool — 35 realistic tenant names
TENANT_NAMES: list[str] = [
    "James Mitchell", "Maria Garcia", "Robert Johnson", "Linda Williams",
    "David Brown", "Jennifer Davis", "Michael Miller", "Sarah Wilson",
    "Daniel Moore", "Jessica Taylor", "Christopher Anderson", "Amanda Thomas",
    "Matthew Jackson", "Ashley White", "Anthony Harris", "Stephanie Martin",
    "Joshua Thompson", "Nicole Martinez", "Andrew Robinson", "Megan Clark",
    "Ryan Lewis", "Lauren Walker", "Brandon Hall", "Rachel Allen",
    "Kevin Young", "Emily King", "Jason Wright", "Samantha Lopez",
    "Justin Hill", "Rebecca Scott", "Tyler Green", "Kayla Adams",
    "Nathan Baker", "Brittany Nelson", "Zachary Carter",
]

# Property name pool
PROPERTY_NAMES: list[str] = [
    "Oakwood Residences",
    "Sunset Terrace",
    "Harbor View Apartments",
    "Cedar Creek Villas",
    "Metropolitan Lofts",
    "Riverwalk Place",
    "Silver Lake Commons",
    "Magnolia Heights",
]

METROS: list[str] = [
    "Austin, TX",
    "Miami, FL",
    "Denver, CO",
    "Phoenix, AZ",
    "Charlotte, NC",
    "Nashville, TN",
    "Tampa, FL",
    "Raleigh, NC",
]

STREET_NAMES: list[str] = [
    "Oak Street", "Elm Avenue", "Maple Drive", "Pine Road",
    "Cedar Boulevard", "Birch Lane", "Willow Way", "Spruce Court",
]


def _random_date_in_range(start: date, end: date) -> date:
    """Return a random date between *start* and *end* (inclusive)."""
    delta_days = (end - start).days
    if delta_days <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta_days))


def _generate_lease_roll(num_units: int, property_seed_offset: int) -> list[dict]:
    """Generate one lease-roll entry per unit for a property."""
    lease_roll: list[dict] = []
    today = date(2026, 6, 22)  # Reference date
    two_years_ago = today - timedelta(days=730)
    expiring_threshold = today + timedelta(days=90)

    for i in range(num_units):
        unit_number = str(100 + i + 1)  # "101", "102", …

        # ~5 % of units are vacant
        is_vacant = random.random() < 0.05

        if is_vacant:
            lease_roll.append(
                {
                    "unit_number": unit_number,
                    "tenant_name": "",
                    "monthly_rent": round(random.uniform(900, 2800), 2),
                    "lease_start": "",
                    "lease_end": "",
                    "status": "Vacant",
                }
            )
        else:
            tenant_name = random.choice(TENANT_NAMES)
            monthly_rent = round(random.uniform(900, 2800), 2)
            lease_start = _random_date_in_range(two_years_ago, today)
            lease_length_months = random.randint(6, 24)
            lease_end = lease_start + timedelta(days=lease_length_months * 30)

            if lease_end <= today:
                # Lease already expired — treat as month-to-month / still active
                status = "Active"
            elif lease_end <= expiring_threshold:
                status = "Expiring Soon"
            else:
                status = "Active"

            lease_roll.append(
                {
                    "unit_number": unit_number,
                    "tenant_name": tenant_name,
                    "monthly_rent": monthly_rent,
                    "lease_start": lease_start.isoformat(),
                    "lease_end": lease_end.isoformat(),
                    "status": status,
                }
            )

    return lease_roll


def _generate_operating_expenses(units: int, purchase_price: float) -> dict:
    """Generate monthly operating-expense figures for a property."""
    return {
        "property_tax": round(purchase_price * random.uniform(0.008, 0.015) / 12, 2),
        "insurance": round(units * random.uniform(30, 60), 2),
        "maintenance": round(units * random.uniform(40, 80), 2),
        "management_fee_percent": round(random.uniform(6, 10), 2),
        "utilities": round(units * random.uniform(20, 50), 2),
        "reserves": round(units * random.uniform(15, 30), 2),
    }


def _generate_portfolio() -> list[dict]:
    """Create a deterministic list of 8 multifamily properties."""
    portfolio: list[dict] = []

    for idx in range(8):
        prop_id = f"prop-{idx + 1:03d}"
        name = PROPERTY_NAMES[idx]
        metro = METROS[idx]
        address = f"{random.randint(100, 9999)} {random.choice(STREET_NAMES)}, {metro}"
        units = random.randint(12, 120)
        year_built = random.randint(1985, 2020)

        purchase_price = round(units * random.uniform(80_000, 180_000), 2)
        current_value = round(purchase_price * random.uniform(1.05, 1.35), 2)

        down_payment_percent = random.choice([20.0, 25.0, 30.0])
        interest_rate = round(random.uniform(5.5, 7.5), 3)
        loan_term_years = 30
        vacancy_rate = round(random.uniform(3.0, 10.0), 2)

        lease_roll = _generate_lease_roll(units, idx)
        operating_expenses = _generate_operating_expenses(units, purchase_price)

        portfolio.append(
            {
                "id": prop_id,
                "name": name,
                "metro": metro,
                "address": address,
                "units": units,
                "year_built": year_built,
                "purchase_price": purchase_price,
                "current_value": current_value,
                "down_payment_percent": down_payment_percent,
                "interest_rate": interest_rate,
                "loan_term_years": loan_term_years,
                "vacancy_rate": vacancy_rate,
                "property_type": "Multifamily",
                "lease_roll": lease_roll,
                "operating_expenses": operating_expenses,
            }
        )

    return portfolio


# Global portfolio — generated once at module-load time
PORTFOLIO: list[dict] = _generate_portfolio()
logger.info("Generated synthetic portfolio of %d properties.", len(PORTFOLIO))

# ============================================================================
# 2. FRED API INTEGRATION
# ============================================================================

MARKET_DATA: dict = {}

FRED_SERIES_MAP: dict[str, str] = {
    "MORTGAGE30US": "mortgage_rate",
    "MSPUS": "median_sale_price",
    "CPIAUCSL": "cpi",
    "RRVRUSQ156N": "vacancy_rate",
}

FRED_DEFAULTS: dict[str, float] = {
    "mortgage_rate": 6.72,
    "median_sale_price": 420400.0,
    "cpi": 314.2,
    "vacancy_rate": 6.6,
}


def fetch_fred_series(series_id: str, api_key: str) -> float | None:
    """
    Fetch the latest observation for a FRED data series.

    Returns the value as a float, or ``None`` on any error (network, parsing, etc.).
    """
    url = (
        f"https://api.stlouisfed.org/fred/series/observations"
        f"?series_id={series_id}"
        f"&api_key={api_key}"
        f"&file_type=json"
        f"&limit=1"
        f"&sort_order=desc"
    )
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            response.raise_for_status()
            data = response.json()
            observations = data.get("observations", [])
            if observations:
                value_str = observations[0].get("value", "")
                if value_str and value_str != ".":
                    return float(value_str)
    except Exception as exc:  # noqa: BLE001
        logger.warning("FRED fetch failed for %s: %s", series_id, exc)
    return None


def _load_market_data() -> None:
    """
    Attempt to fetch live FRED data.  Falls back to hardcoded defaults when
    the ``FRED_API_KEY`` env-var is absent or the request fails.
    """
    global MARKET_DATA  # noqa: PLW0603
    api_key = os.environ.get("FRED_API_KEY", "")

    if not api_key:
        logger.info("FRED_API_KEY not set — using hardcoded market-data defaults.")
        MARKET_DATA = {**FRED_DEFAULTS, "source": "cached"}
        return

    logger.info("Fetching live market data from FRED …")
    source = "live"
    for series_id, field_name in FRED_SERIES_MAP.items():
        value = fetch_fred_series(series_id, api_key)
        if value is not None:
            MARKET_DATA[field_name] = round(value, 2)
        else:
            MARKET_DATA[field_name] = FRED_DEFAULTS[field_name]
            source = "cached"  # at least one series fell back
            logger.warning("Using default for %s (%s).", field_name, FRED_DEFAULTS[field_name])

    MARKET_DATA["source"] = source
    logger.info("Market data loaded: %s", MARKET_DATA)


# ============================================================================
# 3. HELPER / CALCULATION FUNCTIONS
# ============================================================================


def calc_monthly_mortgage(loan_amount: float, annual_rate: float, term_years: int) -> float:
    """
    Standard fixed-rate amortisation payment.

    Parameters
    ----------
    loan_amount : float
        Principal balance.
    annual_rate : float
        Annual interest rate as a *percentage* (e.g. 6.5 for 6.5 %).
    term_years : int
        Loan term in years.

    Returns
    -------
    float
        Monthly payment rounded to 2 decimal places.
    """
    if loan_amount <= 0:
        return 0.0
    if annual_rate <= 0:
        return round(loan_amount / (term_years * 12), 2)
    monthly_rate = (annual_rate / 100.0) / 12.0
    n = term_years * 12
    payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** n) / ((1 + monthly_rate) ** n - 1)
    return round(payment, 2)


def _total_monthly_opex(prop: dict) -> float:
    """Sum all monthly operating expenses for a property (excl. management-fee %)."""
    opex = prop["operating_expenses"]
    return (
        opex["property_tax"]
        + opex["insurance"]
        + opex["maintenance"]
        + opex["utilities"]
        + opex["reserves"]
    )


def _gross_monthly_rent(prop: dict) -> float:
    """Sum of monthly_rent across ALL units (including vacant — represents potential)."""
    return sum(u["monthly_rent"] for u in prop["lease_roll"])


def calc_noi(prop: dict) -> float:
    """
    Calculate annualised Net Operating Income.

    NOI = (Gross Potential Rent − Vacancy Loss − Operating Expenses) × 12
    Management fee is calculated as a % of effective gross income.
    """
    gross_monthly = _gross_monthly_rent(prop)
    vacancy_loss_monthly = gross_monthly * (prop["vacancy_rate"] / 100.0)
    effective_gross_monthly = gross_monthly - vacancy_loss_monthly

    mgmt_pct = prop["operating_expenses"]["management_fee_percent"] / 100.0
    mgmt_fee_monthly = effective_gross_monthly * mgmt_pct

    fixed_opex_monthly = _total_monthly_opex(prop)
    total_opex_monthly = fixed_opex_monthly + mgmt_fee_monthly

    noi_monthly = effective_gross_monthly - total_opex_monthly
    return round(noi_monthly * 12, 2)


def calc_debt_service_schedule(
    loan_amount: float,
    annual_rate: float,
    term_years: int,
    months: int = 12,
) -> list[dict]:
    """
    Return an amortisation schedule for the first *months* months.

    Each entry: ``{month, payment, principal, interest, balance}``
    """
    schedule: list[dict] = []
    if loan_amount <= 0:
        return schedule

    monthly_payment = calc_monthly_mortgage(loan_amount, annual_rate, term_years)
    monthly_rate = (annual_rate / 100.0) / 12.0 if annual_rate > 0 else 0.0
    balance = loan_amount

    for m in range(1, months + 1):
        interest = round(balance * monthly_rate, 2)
        principal = round(monthly_payment - interest, 2)
        balance = round(balance - principal, 2)
        if balance < 0:
            balance = 0.0
        schedule.append(
            {
                "month": m,
                "payment": monthly_payment,
                "principal": principal,
                "interest": interest,
                "balance": balance,
            }
        )

    return schedule


def calc_cash_distribution(prop: dict) -> list[dict]:
    """
    Produce a cash-distribution waterfall for a property.

    Rows:
      1. Net Operating Income
      2. Less: Debt Service
      3. Less: CapEx Reserve
      4. Less: Management Fee
      5. Net Cash to Equity
    """
    noi = calc_noi(prop)

    # Annual debt service
    down_pct = prop["down_payment_percent"] / 100.0
    loan_amount = prop["purchase_price"] * (1 - down_pct)
    annual_debt_service = round(
        calc_monthly_mortgage(loan_amount, prop["interest_rate"], prop["loan_term_years"]) * 12, 2
    )

    # CapEx reserve (annual) — uses the reserves line from opex
    capex_reserve_annual = round(prop["operating_expenses"]["reserves"] * 12, 2)

    # Management fee (annual) — already deducted in NOI calc, shown here for transparency
    gross_monthly = _gross_monthly_rent(prop)
    vacancy_loss_monthly = gross_monthly * (prop["vacancy_rate"] / 100.0)
    effective_gross_monthly = gross_monthly - vacancy_loss_monthly
    mgmt_pct = prop["operating_expenses"]["management_fee_percent"] / 100.0
    mgmt_fee_annual = round(effective_gross_monthly * mgmt_pct * 12, 2)

    # Net cash to equity
    net_cash = round(noi - annual_debt_service - capex_reserve_annual - mgmt_fee_annual, 2)

    # Build waterfall rows
    running = 0.0
    rows: list[dict] = []

    def _pct(val: float) -> float:
        return round((val / noi) * 100, 2) if noi != 0 else 0.0

    # Row 1 — NOI
    running = noi
    rows.append(
        {"label": "Net Operating Income", "amount": noi, "percent_of_gross": _pct(noi), "running_total": round(running, 2)}
    )

    # Row 2 — Debt Service
    running -= annual_debt_service
    rows.append(
        {
            "label": "Less: Debt Service",
            "amount": -annual_debt_service,
            "percent_of_gross": _pct(annual_debt_service),
            "running_total": round(running, 2),
        }
    )

    # Row 3 — CapEx Reserve
    running -= capex_reserve_annual
    rows.append(
        {
            "label": "Less: CapEx Reserve",
            "amount": -capex_reserve_annual,
            "percent_of_gross": _pct(capex_reserve_annual),
            "running_total": round(running, 2),
        }
    )

    # Row 4 — Management Fee
    running -= mgmt_fee_annual
    rows.append(
        {
            "label": "Less: Management Fee",
            "amount": -mgmt_fee_annual,
            "percent_of_gross": _pct(mgmt_fee_annual),
            "running_total": round(running, 2),
        }
    )

    # Row 5 — Net Cash to Equity
    rows.append(
        {
            "label": "Net Cash to Equity",
            "amount": net_cash,
            "percent_of_gross": _pct(net_cash) if noi else 0.0,
            "running_total": round(running, 2),
        }
    )

    return rows


# ============================================================================
# 4. PYDANTIC MODELS
# ============================================================================


class PropertyInput(BaseModel):
    """Input for the quick-calc endpoint (original endpoint preserved)."""

    purchase_price: float
    down_payment_percent: float
    interest_rate: float
    gross_monthly_rent: float
    monthly_operating_expenses: float


class CashflowResult(BaseModel):
    """Output for the quick-calc endpoint (original endpoint preserved)."""

    net_operating_income_annual: float
    monthly_mortgage_payment: float
    monthly_cashflow: float
    cap_rate: float
    cash_on_cash_return: float


class PropertySummary(BaseModel):
    """Compact representation used in the portfolio list."""

    id: str
    name: str
    metro: str
    units: int
    purchase_price: float
    cap_rate: float
    cash_on_cash: float
    monthly_cashflow: float


class LeaseEntry(BaseModel):
    """A single unit's lease information."""

    unit_number: str
    tenant_name: str
    monthly_rent: float
    lease_start: str
    lease_end: str
    status: str  # "Active" | "Expiring Soon" | "Vacant"


class ExpenseBreakdown(BaseModel):
    """Monthly operating-expense breakdown."""

    property_tax: float
    insurance: float
    maintenance: float
    management: float
    utilities: float
    reserves: float
    total: float


class PropertyDetail(BaseModel):
    """Full property record returned by the detail endpoint."""

    id: str
    name: str
    metro: str
    address: str
    units: int
    year_built: int
    purchase_price: float
    current_value: float
    down_payment_percent: float
    interest_rate: float
    loan_term_years: int
    vacancy_rate: float
    property_type: str
    cap_rate: float
    cash_on_cash: float
    monthly_cashflow: float
    noi: float
    loan_amount: float
    monthly_mortgage: float
    lease_roll: List[LeaseEntry]
    expenses: ExpenseBreakdown


class NOIBridgeItem(BaseModel):
    """A single row in the NOI-bridge waterfall."""

    label: str
    value: float
    type: Literal["income", "deduction", "subtotal"]


class DebtScheduleRow(BaseModel):
    """One month's row in the debt-service schedule."""

    month: int
    payment: float
    principal: float
    interest: float
    balance: float


class DebtServiceResponse(BaseModel):
    """Complete debt-service endpoint response."""

    schedule: List[DebtScheduleRow]
    dscr: float


class CashDistributionRow(BaseModel):
    """One row in the cash-distribution waterfall."""

    label: str
    amount: float
    percent_of_gross: float
    running_total: float


class ScenarioInput(BaseModel):
    """User-supplied overrides for what-if analysis."""

    vacancy_rate_override: Optional[float] = None
    interest_rate_override: Optional[float] = None
    rent_growth_percent: Optional[float] = None


class MarketDataResponse(BaseModel):
    """Macro / market data returned from the FRED integration."""

    mortgage_rate: float
    median_sale_price: float
    cpi: float
    vacancy_rate: float
    source: str  # "live" | "cached"


# ============================================================================
# 5. INTERNAL BUILDERS — convert raw dicts → Pydantic models
# ============================================================================


def _build_expense_breakdown(prop: dict) -> ExpenseBreakdown:
    """Construct an ``ExpenseBreakdown`` from a property dict."""
    opex = prop["operating_expenses"]
    gross_monthly = _gross_monthly_rent(prop)
    vacancy_loss = gross_monthly * (prop["vacancy_rate"] / 100.0)
    effective_gross = gross_monthly - vacancy_loss
    mgmt = round(effective_gross * (opex["management_fee_percent"] / 100.0), 2)

    total = round(
        opex["property_tax"] + opex["insurance"] + opex["maintenance"] + mgmt + opex["utilities"] + opex["reserves"],
        2,
    )
    return ExpenseBreakdown(
        property_tax=opex["property_tax"],
        insurance=opex["insurance"],
        maintenance=opex["maintenance"],
        management=mgmt,
        utilities=opex["utilities"],
        reserves=opex["reserves"],
        total=total,
    )


def _build_property_metrics(prop: dict) -> dict:
    """Derive cap_rate, cash_on_cash, monthly_cashflow, noi, loan_amount, monthly_mortgage."""
    noi = calc_noi(prop)
    down_pct = prop["down_payment_percent"] / 100.0
    down_payment = prop["purchase_price"] * down_pct
    loan_amount = round(prop["purchase_price"] * (1 - down_pct), 2)
    monthly_mortgage = calc_monthly_mortgage(loan_amount, prop["interest_rate"], prop["loan_term_years"])
    monthly_noi = round(noi / 12, 2)
    monthly_cashflow = round(monthly_noi - monthly_mortgage, 2)
    cap_rate = round((noi / prop["purchase_price"]) * 100, 2) if prop["purchase_price"] else 0.0
    cash_on_cash = round(((monthly_cashflow * 12) / down_payment) * 100, 2) if down_payment else 0.0

    return {
        "noi": noi,
        "loan_amount": loan_amount,
        "monthly_mortgage": monthly_mortgage,
        "monthly_cashflow": monthly_cashflow,
        "cap_rate": cap_rate,
        "cash_on_cash": cash_on_cash,
    }


def _build_property_summary(prop: dict) -> PropertySummary:
    metrics = _build_property_metrics(prop)
    return PropertySummary(
        id=prop["id"],
        name=prop["name"],
        metro=prop["metro"],
        units=prop["units"],
        purchase_price=prop["purchase_price"],
        cap_rate=metrics["cap_rate"],
        cash_on_cash=metrics["cash_on_cash"],
        monthly_cashflow=metrics["monthly_cashflow"],
    )


def _build_property_detail(prop: dict) -> PropertyDetail:
    metrics = _build_property_metrics(prop)
    expenses = _build_expense_breakdown(prop)
    lease_entries = [LeaseEntry(**u) for u in prop["lease_roll"]]

    return PropertyDetail(
        id=prop["id"],
        name=prop["name"],
        metro=prop["metro"],
        address=prop["address"],
        units=prop["units"],
        year_built=prop["year_built"],
        purchase_price=prop["purchase_price"],
        current_value=prop["current_value"],
        down_payment_percent=prop["down_payment_percent"],
        interest_rate=prop["interest_rate"],
        loan_term_years=prop["loan_term_years"],
        vacancy_rate=prop["vacancy_rate"],
        property_type=prop["property_type"],
        cap_rate=metrics["cap_rate"],
        cash_on_cash=metrics["cash_on_cash"],
        monthly_cashflow=metrics["monthly_cashflow"],
        noi=metrics["noi"],
        loan_amount=metrics["loan_amount"],
        monthly_mortgage=metrics["monthly_mortgage"],
        lease_roll=lease_entries,
        expenses=expenses,
    )


def _find_property(property_id: str) -> dict:
    """Look up a property by its id, raising 404 if not found."""
    for prop in PORTFOLIO:
        if prop["id"] == property_id:
            return prop
    raise HTTPException(status_code=404, detail=f"Property '{property_id}' not found.")


def _apply_scenario(prop: dict, scenario: ScenarioInput) -> dict:
    """
    Return a *shallow copy* of the property dict with scenario overrides applied.

    - vacancy_rate_override replaces the vacancy_rate
    - interest_rate_override replaces the interest_rate
    - rent_growth_percent scales every unit's monthly_rent by (1 + pct/100)
    """
    import copy

    modified = copy.deepcopy(prop)

    if scenario.vacancy_rate_override is not None:
        modified["vacancy_rate"] = round(scenario.vacancy_rate_override, 2)

    if scenario.interest_rate_override is not None:
        modified["interest_rate"] = round(scenario.interest_rate_override, 3)

    if scenario.rent_growth_percent is not None:
        growth_factor = 1 + (scenario.rent_growth_percent / 100.0)
        for unit in modified["lease_roll"]:
            unit["monthly_rent"] = round(unit["monthly_rent"] * growth_factor, 2)

    return modified


# ============================================================================
# 6. STARTUP EVENT — load market data
# ============================================================================


@app.on_event("startup")
async def on_startup() -> None:
    """Run once when the server starts: load FRED market data."""
    logger.info("Application starting up …")
    _load_market_data()
    logger.info("Startup complete.  Portfolio size: %d properties.", len(PORTFOLIO))


# ============================================================================
# 7. ENDPOINTS
# ============================================================================

# ---- 1. Original quick-calc endpoint (PRESERVED EXACTLY) ------------------


@app.post("/api/calculate", response_model=CashflowResult)
def calculate_cashflow(data: PropertyInput):
    """Quick calculator for manual property inputs — original logic preserved."""
    try:
        down_payment = data.purchase_price * (data.down_payment_percent / 100.0)
        loan_amount = data.purchase_price - down_payment

        # Monthly mortgage payment calculation (Assuming 30-year fixed)
        if loan_amount > 0 and data.interest_rate > 0:
            monthly_interest_rate = (data.interest_rate / 100.0) / 12.0
            num_payments = 30 * 12
            monthly_mortgage_payment = loan_amount * (
                monthly_interest_rate * (1 + monthly_interest_rate) ** num_payments
            ) / ((1 + monthly_interest_rate) ** num_payments - 1)
        elif loan_amount > 0 and data.interest_rate == 0:
            monthly_mortgage_payment = loan_amount / (30 * 12)
        else:
            monthly_mortgage_payment = 0.0

        # NOI
        net_operating_income_annual = (data.gross_monthly_rent - data.monthly_operating_expenses) * 12.0

        # Monthly Cashflow
        monthly_cashflow = (data.gross_monthly_rent - data.monthly_operating_expenses) - monthly_mortgage_payment

        # Cap Rate
        if data.purchase_price > 0:
            cap_rate = (net_operating_income_annual / data.purchase_price) * 100.0
        else:
            cap_rate = 0.0

        # Cash-on-Cash Return
        if down_payment > 0:
            cash_on_cash_return = ((monthly_cashflow * 12.0) / down_payment) * 100.0
        elif data.purchase_price > 0:
            # if 0 down payment, CoC return is technically infinite, but we can default to 0 or use cap rate
            cash_on_cash_return = 0.0
        else:
            cash_on_cash_return = 0.0

        return CashflowResult(
            net_operating_income_annual=round(net_operating_income_annual, 2),
            monthly_mortgage_payment=round(monthly_mortgage_payment, 2),
            monthly_cashflow=round(monthly_cashflow, 2),
            cap_rate=round(cap_rate, 2),
            cash_on_cash_return=round(cash_on_cash_return, 2),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---- 2. Portfolio list ----------------------------------------------------


@app.get("/api/portfolio", response_model=List[PropertySummary])
def get_portfolio():
    """Return a summary card for every property in the portfolio."""
    return [_build_property_summary(p) for p in PORTFOLIO]


# ---- 3. Property detail ---------------------------------------------------


@app.get("/api/property/{property_id}", response_model=PropertyDetail)
def get_property_detail(property_id: str):
    """Full property record including lease roll, expenses, and derived metrics."""
    prop = _find_property(property_id)
    return _build_property_detail(prop)


# ---- 4. NOI bridge / waterfall --------------------------------------------


@app.get("/api/property/{property_id}/noi-bridge", response_model=List[NOIBridgeItem])
def get_noi_bridge(property_id: str):
    """
    NOI waterfall decomposition:

    Gross Potential Rent  →  – Vacancy Loss  →  Effective Gross Income
    →  – OpEx items  →  Net Operating Income
    """
    prop = _find_property(property_id)
    opex = prop["operating_expenses"]

    gross_monthly = _gross_monthly_rent(prop)
    gross_annual = round(gross_monthly * 12, 2)

    vacancy_loss_monthly = gross_monthly * (prop["vacancy_rate"] / 100.0)
    vacancy_loss_annual = round(vacancy_loss_monthly * 12, 2)

    effective_gross_annual = round(gross_annual - vacancy_loss_annual, 2)

    # Management fee is a % of effective gross income
    mgmt_pct = opex["management_fee_percent"] / 100.0
    effective_gross_monthly = gross_monthly - vacancy_loss_monthly
    mgmt_fee_annual = round(effective_gross_monthly * mgmt_pct * 12, 2)

    property_tax_annual = round(opex["property_tax"] * 12, 2)
    insurance_annual = round(opex["insurance"] * 12, 2)
    maintenance_annual = round(opex["maintenance"] * 12, 2)
    utilities_annual = round(opex["utilities"] * 12, 2)
    reserves_annual = round(opex["reserves"] * 12, 2)

    noi = round(
        effective_gross_annual
        - property_tax_annual
        - insurance_annual
        - maintenance_annual
        - mgmt_fee_annual
        - utilities_annual
        - reserves_annual,
        2,
    )

    return [
        NOIBridgeItem(label="Gross Potential Rent", value=gross_annual, type="income"),
        NOIBridgeItem(label="Vacancy Loss", value=-vacancy_loss_annual, type="deduction"),
        NOIBridgeItem(label="Effective Gross Income", value=effective_gross_annual, type="subtotal"),
        NOIBridgeItem(label="Property Tax", value=-property_tax_annual, type="deduction"),
        NOIBridgeItem(label="Insurance", value=-insurance_annual, type="deduction"),
        NOIBridgeItem(label="Maintenance", value=-maintenance_annual, type="deduction"),
        NOIBridgeItem(label="Management Fee", value=-mgmt_fee_annual, type="deduction"),
        NOIBridgeItem(label="Utilities", value=-utilities_annual, type="deduction"),
        NOIBridgeItem(label="Reserves", value=-reserves_annual, type="deduction"),
        NOIBridgeItem(label="Net Operating Income", value=noi, type="subtotal"),
    ]


# ---- 5. Debt service schedule ---------------------------------------------


@app.get("/api/property/{property_id}/debt-service", response_model=DebtServiceResponse)
def get_debt_service(property_id: str):
    """12-month amortisation schedule plus Debt-Service Coverage Ratio (DSCR)."""
    prop = _find_property(property_id)

    down_pct = prop["down_payment_percent"] / 100.0
    loan_amount = prop["purchase_price"] * (1 - down_pct)

    schedule_dicts = calc_debt_service_schedule(
        loan_amount, prop["interest_rate"], prop["loan_term_years"], months=12
    )
    schedule = [DebtScheduleRow(**row) for row in schedule_dicts]

    annual_debt_service = round(
        calc_monthly_mortgage(loan_amount, prop["interest_rate"], prop["loan_term_years"]) * 12, 2
    )
    noi = calc_noi(prop)
    dscr = round(noi / annual_debt_service, 2) if annual_debt_service > 0 else 0.0

    return DebtServiceResponse(schedule=schedule, dscr=dscr)


# ---- 6. Cash distribution waterfall ---------------------------------------


@app.get(
    "/api/property/{property_id}/cash-distribution",
    response_model=List[CashDistributionRow],
)
def get_cash_distribution(property_id: str):
    """Annual cash-distribution waterfall: NOI → Debt → CapEx → Mgmt → Equity."""
    prop = _find_property(property_id)
    rows = calc_cash_distribution(prop)
    return [CashDistributionRow(**r) for r in rows]


# ---- 7. Scenario / what-if analysis ---------------------------------------


@app.post("/api/property/{property_id}/scenario", response_model=PropertyDetail)
def run_scenario(property_id: str, scenario: ScenarioInput):
    """
    Apply user-defined overrides (vacancy, rate, rent growth) and return
    the recalculated ``PropertyDetail``.
    """
    prop = _find_property(property_id)
    modified = _apply_scenario(prop, scenario)
    return _build_property_detail(modified)


# ---- 8. Market data -------------------------------------------------------


@app.get("/api/market-data", response_model=MarketDataResponse)
def get_market_data():
    """Return the latest macro / market data (FRED or cached defaults)."""
    if not MARKET_DATA:
        _load_market_data()
    return MarketDataResponse(
        mortgage_rate=MARKET_DATA.get("mortgage_rate", FRED_DEFAULTS["mortgage_rate"]),
        median_sale_price=MARKET_DATA.get("median_sale_price", FRED_DEFAULTS["median_sale_price"]),
        cpi=MARKET_DATA.get("cpi", FRED_DEFAULTS["cpi"]),
        vacancy_rate=MARKET_DATA.get("vacancy_rate", FRED_DEFAULTS["vacancy_rate"]),
        source=MARKET_DATA.get("source", "cached"),
    )


# ---- 9. CSV download ------------------------------------------------------


@app.get("/api/download/sample-data")
def download_sample_data():
    """Stream a CSV of all properties with key financial metrics."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow(
        [
            "ID",
            "Name",
            "Metro",
            "Address",
            "Units",
            "Year Built",
            "Purchase Price",
            "Current Value",
            "Down Payment %",
            "Interest Rate %",
            "Loan Term (yrs)",
            "Vacancy Rate %",
            "Property Type",
            "NOI (Annual)",
            "Loan Amount",
            "Monthly Mortgage",
            "Monthly Cashflow",
            "Cap Rate %",
            "Cash-on-Cash %",
        ]
    )

    for prop in PORTFOLIO:
        metrics = _build_property_metrics(prop)
        writer.writerow(
            [
                prop["id"],
                prop["name"],
                prop["metro"],
                prop["address"],
                prop["units"],
                prop["year_built"],
                prop["purchase_price"],
                prop["current_value"],
                prop["down_payment_percent"],
                prop["interest_rate"],
                prop["loan_term_years"],
                prop["vacancy_rate"],
                prop["property_type"],
                metrics["noi"],
                metrics["loan_amount"],
                metrics["monthly_mortgage"],
                metrics["monthly_cashflow"],
                metrics["cap_rate"],
                metrics["cash_on_cash"],
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=portfolio_summary.csv"},
    )


# ============================================================================
# 8. MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)