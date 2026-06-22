"use client";

import { useState } from "react";
import type { PropertyInput } from "@/types";

// ──────────────────────────────────────────────────────────────
// Input field configuration — drives the form rendering
// ──────────────────────────────────────────────────────────────
interface FieldConfig {
  key: keyof PropertyInput;
  label: string;
  prefix: string;
  suffix: string;
  step: number;
  min: number;
  placeholder: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "purchase_price",
    label: "Purchase Price",
    prefix: "$",
    suffix: "",
    step: 5000,
    min: 0,
    placeholder: "300000",
  },
  {
    key: "down_payment_percent",
    label: "Down Payment",
    prefix: "",
    suffix: "%",
    step: 0.5,
    min: 0,
    placeholder: "20",
  },
  {
    key: "interest_rate",
    label: "Interest Rate",
    prefix: "",
    suffix: "%",
    step: 0.125,
    min: 0,
    placeholder: "6.5",
  },
  {
    key: "gross_monthly_rent",
    label: "Gross Monthly Rent",
    prefix: "$",
    suffix: "",
    step: 50,
    min: 0,
    placeholder: "2500",
  },
  {
    key: "monthly_operating_expenses",
    label: "Monthly Operating Expenses",
    prefix: "$",
    suffix: "",
    step: 25,
    min: 0,
    placeholder: "800",
  },
];

// ──────────────────────────────────────────────────────────────
// Component Props
// ──────────────────────────────────────────────────────────────
interface InputPanelProps {
  values: PropertyInput;
  onChange: (field: keyof PropertyInput, value: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

// ──────────────────────────────────────────────────────────────
// InputPanel Component
// ──────────────────────────────────────────────────────────────
export function InputPanel({
  values,
  onChange,
  onSubmit,
  isLoading,
}: InputPanelProps) {
  const [focusedField, setFocusedField] = useState<keyof PropertyInput | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-dex-cyan animate-pulse-glow" />
        <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-dex-tx2">
          Property Assumptions
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5">
        {FIELDS.map((field) => (
          <div key={field.key} className="group">
            <label
              htmlFor={field.key}
              className="block text-xs font-medium text-dex-tx2 mb-1.5 tracking-wide uppercase"
            >
              {field.label}
            </label>
            <div
              className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                focusedField === field.key
                  ? "border-dex-cyan shadow-[0_0_0_2px_rgba(56,189,248,0.15)]"
                  : "border-dex-border hover:border-dex-tx3"
              } bg-dex-bg/60`}
            >
              {/* Prefix */}
              {field.prefix && (
                <span className="pl-4 text-dex-tx3 font-mono text-sm select-none">
                  {field.prefix}
                </span>
              )}

              <input
                id={field.key}
                name={field.key}
                type="number"
                step={field.step}
                min={field.min}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) =>
                  onChange(field.key, parseFloat(e.target.value) || 0)
                }
                onFocus={() => setFocusedField(field.key)}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent px-3 py-3 text-sm font-mono text-dex-tx placeholder:text-dex-tx3/50 focus:outline-none w-full"
              />

              {/* Suffix */}
              {field.suffix && (
                <span className="pr-4 text-dex-tx3 font-mono text-sm select-none">
                  {field.suffix}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              isLoading
                ? "bg-dex-border text-dex-tx3 cursor-not-allowed"
                : "bg-gradient-to-r from-dex-cyan to-dex-indigo text-white hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Calculating…
              </span>
            ) : (
              "Calculate Cashflow"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
