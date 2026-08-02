import numpy as np
import pandas as pd
from scipy.optimize import minimize


TRADING_DAYS = 252


def prepare_returns(prices: dict) -> pd.DataFrame:
    price_df = pd.DataFrame(prices)
    price_df = price_df.dropna()

    if price_df.empty or len(price_df) < 2:
        raise ValueError("Not enough price data to calculate returns.")

    returns = price_df.pct_change().dropna()
    return returns


def portfolio_metrics(weights, mean_returns, cov_matrix, risk_free_rate):
    weights = np.array(weights)

    portfolio_return = np.sum(mean_returns * weights)
    portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

    if portfolio_volatility == 0:
        sharpe_ratio = 0
    else:
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility

    return {
        "expectedReturn": float(portfolio_return),
        "volatility": float(portfolio_volatility),
        "sharpeRatio": float(sharpe_ratio),
    }


def optimize_portfolio(returns: pd.DataFrame, risk_free_rate: float):
    tickers = list(returns.columns)
    n = len(tickers)

    mean_returns = returns.mean() * TRADING_DAYS
    cov_matrix = returns.cov() * TRADING_DAYS

    def negative_sharpe(weights):
        metrics = portfolio_metrics(weights, mean_returns, cov_matrix, risk_free_rate)
        return -metrics["sharpeRatio"]

    constraints = ({
        "type": "eq",
        "fun": lambda weights: np.sum(weights) - 1
    })

    bounds = tuple((0, 1) for _ in range(n))
    initial_guess = np.array([1 / n] * n)

    result = minimize(
        negative_sharpe,
        initial_guess,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints
    )

    if not result.success:
        raise ValueError("Portfolio optimization failed.")

    optimal_weights = result.x
    

    return {
        "tickers": tickers,
        "weights": {
            ticker: float(round(weight, 4))
            for ticker, weight in zip(tickers, optimal_weights)
        },
        "metrics": portfolio_metrics(
            optimal_weights,
            mean_returns,
            cov_matrix,
            risk_free_rate
        )
    }


def calculate_current_portfolio(current_weights: dict, returns: pd.DataFrame, risk_free_rate: float):
    tickers = list(returns.columns)

    weights = np.array([
        current_weights.get(ticker, 0)
        for ticker in tickers
    ])

    weight_sum = weights.sum()

    if weight_sum == 0:
        raise ValueError("Current portfolio weights are empty or invalid.")

    weights = weights / weight_sum

    mean_returns = returns.mean() * TRADING_DAYS
    cov_matrix = returns.cov() * TRADING_DAYS

    return {
        "weights": {
            ticker: float(round(weight, 4))
            for ticker, weight in zip(tickers, weights)
        },
        "metrics": portfolio_metrics(weights, mean_returns, cov_matrix, risk_free_rate)
    }


def rebalance_suggestions(current_weights: dict, optimal_weights: dict):
    suggestions = []

    all_tickers = set(current_weights.keys()) | set(optimal_weights.keys())

    for ticker in all_tickers:
        current = current_weights.get(ticker, 0)
        optimal = optimal_weights.get(ticker, 0)
        difference = optimal - current

        if abs(difference) < 0.01:
            action = "HOLD"
        elif difference > 0:
            action = "BUY"
        else:
            action = "SELL"

        suggestions.append({
            "ticker": ticker,
            "currentWeight": round(current, 4),
            "optimalWeight": round(optimal, 4),
            "difference": round(difference, 4),
            "action": action
        })

    return suggestions


def monte_carlo_simulation(
    initial_capital: float,
    expected_return: float,
    volatility: float,
    horizon_days: int,
    simulations: int
):
    dt = 1 / TRADING_DAYS

    paths = np.zeros((simulations, horizon_days + 1))
    paths[:, 0] = initial_capital

    for day in range(1, horizon_days + 1):
        random_shocks = np.random.normal(0, 1, simulations)

        daily_growth = np.exp(
            (expected_return - 0.5 * volatility ** 2) * dt
            + volatility * np.sqrt(dt) * random_shocks
        )

        paths[:, day] = paths[:, day - 1] * daily_growth

    percentile_5 = np.percentile(paths, 5, axis=0)
    percentile_50 = np.percentile(paths, 50, axis=0)
    percentile_95 = np.percentile(paths, 95, axis=0)

    graph_data = []

    for day in range(horizon_days + 1):
        graph_data.append({
            "day": day,
            "p5": float(round(percentile_5[day], 2)),
            "median": float(round(percentile_50[day], 2)),
            "p95": float(round(percentile_95[day], 2))
        })

    final_values = paths[:, -1]

    return {
        "graph": graph_data,
        "summary": {
            "expectedFinalValue": float(round(np.mean(final_values), 2)),
            "medianFinalValue": float(round(np.median(final_values), 2)),
            "worstCase5Percent": float(round(np.percentile(final_values, 5), 2)),
            "bestCase95Percent": float(round(np.percentile(final_values, 95), 2)),
            "probabilityOfLoss": float(round(np.mean(final_values < initial_capital), 4))
        }
    }