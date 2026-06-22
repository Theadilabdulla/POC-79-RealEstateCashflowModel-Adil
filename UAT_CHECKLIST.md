# UAT_CHECKLIST.md — Functional User Acceptance Testing

**Project:** POC 79 — Real Estate Cashflow Model  
**Date:** 2026-06-22  
**Tester:** Engineer / Intern  
**Prerequisites:**  
1. Backend running: `cd backend && source venv/bin/activate && uvicorn main:app --port 8000`
2. Frontend running: `cd frontend && npm run dev`

---

## 1. Initial Load & Market Data

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 1.1 | Dashboard renders | Top bar, Market Indicators, Property Selector appear | ☐ |
| 1.2 | FRED Market Data loads | Shows Mortgage, Sale Price, CPI, Vacancy with "Live" or "Cached" badge | ☐ |
| 1.3 | First property auto-selects | The first property in the portfolio is highlighted and data panels populate | ☐ |

---

## 2. Portfolio Interaction

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 2.1 | Click a different property | UI shows loading skeleton, then updates all charts/tables | ☐ |
| 2.2 | Property data updates | Metrics, Lease Roll, and Debt schedule reflect the new property | ☐ |

---

## 3. Scenario Analysis

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 3.1 | Adjust Vacancy slider | Slider updates value, UI waits for "Run Scenario" click | ☐ |
| 3.2 | Click "Run Scenario" | KPI metrics (NOI, Cashflow, Cap Rate) recalculate based on shock | ☐ |
| 3.3 | Click "Base Case" | Resets sliders and metrics to original state | ☐ |

---

## 4. Visualizations & Tables

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 4.1 | NOI Bridge Chart | Displays waterfall of Gross Rent → Vacancy → OpEx → NOI. Tooltips work. | ☐ |
| 4.2 | Debt Service Schedule | Displays 12 months of amortization (Payment, Principal, Interest, Balance) | ☐ |
| 4.3 | Cash Distribution | Shows NOI → Debt → Reserves → Management → Cash to Equity | ☐ |
| 4.4 | Lease Roll | Displays table of units with Active/Vacant/Expiring Soon badges | ☐ |

---

## 5. Editorial & Export

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 5.1 | "Why This Matters" Panel | Displays Capital Formation explanation | ☐ |
| 5.2 | "Who Controls the Rail" | Displays sequence flow from Tenants to LP Investors | ☐ |
| 5.3 | CSV Download | Clicking "Download Sample Data" triggers browser file download | ☐ |
| 5.4 | CSV Integrity | CSV opens cleanly in Excel/Sheets with all 8 properties | ☐ |

---

## Summary

| Category | Test Cases | Status |
|---|---|---|
| Load & Market Data | 3 | ☐ |
| Portfolio Interaction | 2 | ☐ |
| Scenario Analysis | 3 | ☐ |
| Visualizations & Tables | 4 | ☐ |
| Editorial & Export | 4 | ☐ |
| **TOTAL** | **16** | ☐ |

**UAT Sign-off:** ________________________________  
**Date:** ________________________________
