from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
    
from optimizer import (
    prepare_returns,
    optimize_portfolio,
    calculate_current_portfolio,
    rebalance_suggestions,
    monte_carlo_simulation
)


import os

app = FastAPI(title="FinTrack Quant Service")

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")] if allowed_origins_raw != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizeRequest(BaseModel):
    initialCapital: float
    riskFreeRate: float = 0.06
    horizonDays: int = 252
    simulations: int = 1000
    currentWeights: Dict[str, float]
    prices: Dict[str, List[float]]


@app.get("/")
def health_check():
    return {
        "status": "running",
        "service": "FinTrack Quant Portfolio Optimizer"
    }


@app.post("/optimize")
def optimize(request: OptimizeRequest):
    try:
        returns = prepare_returns(request.prices)

        current = calculate_current_portfolio(
            request.currentWeights,
            returns,
            request.riskFreeRate
        )

        optimal = optimize_portfolio(
            returns,
            request.riskFreeRate
        )

        current_metrics = current["metrics"]
        optimal_metrics = optimal["metrics"]

        current_mc = monte_carlo_simulation(
            initial_capital=request.initialCapital,
            expected_return=current_metrics["expectedReturn"],
            volatility=current_metrics["volatility"],
            horizon_days=request.horizonDays,
            simulations=request.simulations
        )

        optimal_mc = monte_carlo_simulation(
            initial_capital=request.initialCapital,
            expected_return=optimal_metrics["expectedReturn"],
            volatility=optimal_metrics["volatility"],
            horizon_days=request.horizonDays,
            simulations=request.simulations
        )

        rebalance = rebalance_suggestions(
            current["weights"],
            optimal["weights"]
        )

        return {
            "currentPortfolio": {
                "weights": current["weights"],
                **current_metrics,
                "finalExpectedValue": current_mc["summary"]["expectedFinalValue"]
            },
            "optimalPortfolio": {
                "weights": optimal["weights"],
                **optimal_metrics,
                "finalExpectedValue": optimal_mc["summary"]["expectedFinalValue"]
            },
            "rebalance": rebalance,
            "monteCarlo": {
                "current": current_mc,
                "optimal": optimal_mc
            }
        }

    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))