from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PropertyInput(BaseModel):
    purchase_price: float
    down_payment_percent: float
    interest_rate: float
    gross_monthly_rent: float
    monthly_operating_expenses: float

class CashflowResult(BaseModel):
    net_operating_income_annual: float
    monthly_mortgage_payment: float
    monthly_cashflow: float
    cap_rate: float
    cash_on_cash_return: float

@app.post("/api/calculate", response_model=CashflowResult)
def calculate_cashflow(data: PropertyInput):
    try:
        down_payment = data.purchase_price * (data.down_payment_percent / 100.0)
        loan_amount = data.purchase_price - down_payment
        
        # Monthly mortgage payment calculation (Assuming 30-year fixed)
        if loan_amount > 0 and data.interest_rate > 0:
            monthly_interest_rate = (data.interest_rate / 100.0) / 12.0
            num_payments = 30 * 12
            monthly_mortgage_payment = loan_amount * (
                monthly_interest_rate * (1 + monthly_interest_rate)**num_payments
            ) / ((1 + monthly_interest_rate)**num_payments - 1)
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
            cash_on_cash_return=round(cash_on_cash_return, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)