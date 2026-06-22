# UAT_CHECKLIST.md — Functional User Acceptance Testing

**Project:** POC 79 — Real Estate Cashflow Model  
**Date:** 2026-06-22  
**Tester:** Engineer / Intern  
**Prerequisites:**  
1. Backend running: `python main.py` on port 8000 (cashflow backend with POST `/api/calculate`)
2. Frontend running: `cd frontend && npm run dev`

---

## 1. Initial Load

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 1.1 | Page loads without errors | Dashboard renders with header, input panel, output panel, footer | ☐ |
| 1.2 | Default values populated | Purchase Price: 300000, Down Payment: 20, Interest Rate: 6.5, Rent: 2500, Expenses: 800 | ☐ |
| 1.3 | Output panel shows empty state | "No Results Yet" message with instruction text displayed | ☐ |
| 1.4 | Header branding correct | "REAL ESTATE CASHFLOW MODEL" with cyan pulsing dot, POC 79 badge | ☐ |
| 1.5 | Footer displays backend URL | Shows "127.0.0.1:8000" | ☐ |

---

## 2. Calculation Flow (The Handshake)

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 2.1 | Click "Calculate Cashflow" with defaults | API call made, loading spinner appears on button | ☐ |
| 2.2 | Results appear after calculation | All 5 metric cards rendered with values | ☐ |
| 2.3 | Cap Rate displayed as hero card | Larger font (3xl–4xl), icon ◎, formula subtitle "NOI ÷ Purchase Price" | ☐ |
| 2.4 | Cash-on-Cash Return displayed as hero card | Larger font (3xl–4xl), icon ⟐, formula subtitle "Annual Cashflow ÷ Down Payment" | ☐ |
| 2.5 | Monthly Cashflow displayed | Currency format ($X,XXX), correct icon ↗ | ☐ |
| 2.6 | NOI (Annual) displayed | Currency format ($X,XXX), correct icon Σ | ☐ |
| 2.7 | Monthly Mortgage Payment displayed | Currency format ($X,XXX), correct icon ⌂ | ☐ |

---

## 3. Data Correctness

| # | Test Case | Input | Expected Behavior | Pass/Fail |
|---|---|---|---|---|
| 3.1 | Positive cashflow scenario | High rent ($3000), low expenses ($500) | Monthly Cashflow green, positive CoC Return green | ☐ |
| 3.2 | Negative cashflow scenario | Low rent ($1000), high expenses ($1200) | Monthly Cashflow red (negative), CoC Return red | ☐ |
| 3.3 | Zero down payment edge case | Down Payment: 0% | Should calculate (full financing) or return backend error gracefully | ☐ |
| 3.4 | Very high purchase price | $10,000,000 | Large numbers formatted with commas correctly | ☐ |
| 3.5 | Zero rent | Rent: 0 | Negative cashflow displayed correctly in red | ☐ |

---

## 4. Error Handling

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 4.1 | Backend offline — click Calculate | Error card appears: "Network error — could not reach the backend..." with recovery guidance | ☐ |
| 4.2 | Backend returns 422 (validation error) | Error card shows API error detail | ☐ |
| 4.3 | Re-calculate after error | Error clears, new results displayed or new error shown | ☐ |

---

## 5. Interactions & Micro-animations

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 5.1 | Focus on input field | Cyan border glow appears on focused field | ☐ |
| 5.2 | Blur input field | Glow removed, border returns to default | ☐ |
| 5.3 | Hover on "Calculate Cashflow" button | Shadow glow intensifies, slight scale-up (1.02) | ☐ |
| 5.4 | Click button (mousedown) | Button scales down (0.98) for tactile feel | ☐ |
| 5.5 | Metric cards animate in | Cards slide in with staggered delay (0.08s increments) | ☐ |
| 5.6 | Hover on metric cards | Border brightens, shadow deepens | ☐ |
| 5.7 | Header pulsing dot | Cyan dot pulses with `pulse-glow` animation | ☐ |

---

## 6. Loading States

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 6.1 | During API call | Button shows spinner + "Calculating…" text, is disabled | ☐ |
| 6.2 | Skeleton placeholders | If re-calculating, shimmer skeleton cards appear in output grid | ☐ |
| 6.3 | Button re-enables after response | Button returns to "Calculate Cashflow" state | ☐ |

---

## 7. Responsive Behavior

| # | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| 7.1 | Desktop (≥1024px) | Two-column layout: Input (4 cols), Output (8 cols) side by side | ☐ |
| 7.2 | Tablet (768–1023px) | Stacked layout, metric cards in 2-col grid | ☐ |
| 7.3 | Mobile (< 768px) | Full-width stacked, single column metric cards | ☐ |
| 7.4 | Page scrolls on mobile | Content is scrollable (no overflow-hidden on body) | ☐ |
| 7.5 | Header stays sticky | Header remains at top when scrolling | ☐ |

---

## 8. Code Quality

| # | Criteria | Expected | Pass/Fail |
|---|---|---|---|
| 8.1 | TypeScript strict mode | No `any` types in codebase | ☐ |
| 8.2 | `next build` passes | Zero errors, zero type warnings | ☐ |
| 8.3 | No console.log statements | Clean production code | ☐ |
| 8.4 | No unused imports | All imports are consumed | ☐ |
| 8.5 | Accessible inputs | All inputs have `<label>` with `htmlFor` matching `id` | ☐ |

---

## Summary

| Category | Test Cases | Status |
|---|---|---|
| Initial Load | 5 | ☐ |
| Calculation Flow | 7 | ☐ |
| Data Correctness | 5 | ☐ |
| Error Handling | 3 | ☐ |
| Interactions | 7 | ☐ |
| Loading States | 3 | ☐ |
| Responsive | 5 | ☐ |
| Code Quality | 5 | ☐ |
| **TOTAL** | **40** | ☐ |

**UAT Sign-off:** ________________________________  
**Date:** ________________________________
