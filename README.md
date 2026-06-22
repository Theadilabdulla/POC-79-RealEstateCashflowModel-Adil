# POC 79 — Real Estate Cashflow Model

![Dashboard](https://via.placeholder.com/1200x600.png?text=Real+Estate+Cashflow+Model+Dashboard)

## Project Overview

The Real Estate Cashflow Model is a production-grade Intelligence Library dashboard designed to model the "Capital Formation" rail of multifamily real estate. It demonstrates how rental income flows through a property entity, services debt obligations, covers operating costs, and distributes cash to equity holders.

This tool is built for everyday viewers, operators, and allocators to intuitively understand real estate finance, stress-test assumptions, and analyze risk-adjusted returns.

## Architecture

The system is split into two components:

1. **Backend (FastAPI)**: 
   - A high-performance Python backend serving a synthetic, deterministic portfolio of 8 multifamily properties.
   - Live macro-data integration via the FRED API (Mortgage Rates, CPI, Vacancy Rates).
   - Core financial calculation engines for NOI waterfalls, debt service amortization, scenario modeling, and CSV export.
2. **Frontend (Next.js + TypeScript)**: 
   - A highly responsive, modern dark-mode glassmorphism dashboard.
   - Built with Next.js (App Router), Tailwind CSS v3, and Recharts.
   - Features dynamic scenario toggles, interactive visualizations, and plain-language editorial panels.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- [FRED API Key](https://fred.stlouisfed.org/docs/api/api_key.html) (Optional, but recommended for live market data)

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic httpx

# Set your FRED API Key (optional)
export FRED_API_KEY="your_api_key_here"

# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

## Screenshots

*(In a real repository, actual screenshots of the UI would be placed here. Features to highlight: Property Selector, Scenario Toggles, NOI Waterfall Bridge, Debt Service Schedule, and Editorial Panels).*