# FinTrack — Full-Stack Stock Trading, Portfolio Management & Quant Optimization Platform

FinTrack is a full-stack stock trading and portfolio management dashboard built with the MERN stack. It allows users to sign up, log in, view real-time stock prices, place buy/sell trades, manage watchlists, track portfolio holdings, analyze returns, use an AI-powered finance chatbot, run stock price prediction, and perform quantitative portfolio optimization.

The platform has been extended with a Python-based **Quant Portfolio Optimizer Microservice** that applies financial engineering concepts such as Markowitz mean-variance optimization, Sharpe ratio maximization, current-vs-optimal portfolio comparison, rebalancing suggestions, and Monte Carlo simulations.

---

## Features

### Authentication & User Management

* User registration and login
* JWT-based authentication
* Secure password hashing using bcrypt
* HTTP-only cookie/session support
* Protected dashboard routes
* User-specific portfolio and trading data

---

### Stock Trading Dashboard

* Real-time market overview
* Stock price display using AlphaVantage API
* Watchlist support
* Buy/Sell trading engine
* Transaction history
* Current holdings tracking
* Portfolio value calculation
* Profit and loss tracking
* Returns analytics
* Market analytics dashboard

---

### Portfolio Management

FinTrack tracks the user's active stock holdings and portfolio state.

The portfolio system supports:

* User-specific holdings
* Quantity-based stock positions
* Current price tracking
* Portfolio value calculation
* Investment tracking
* Returns calculation
* Profit/loss analysis
* Transaction history

---

### Quant Portfolio Optimizer

The Quant Optimizer is the final financial engineering layer added to FinTrack.

It compares the user's current portfolio with a mathematically optimized portfolio using Markowitz portfolio theory.

The optimizer provides:

* Current portfolio weight calculation
* Markowitz mean-variance optimization
* Maximum Sharpe ratio portfolio
* Current vs optimal allocation comparison
* Portfolio expected return
* Portfolio volatility
* Sharpe ratio
* Rebalancing suggestions
* Monte Carlo simulation for current portfolio
* Monte Carlo simulation for optimized portfolio
* Graph-based risk visualization

---

### Monte Carlo Simulation

FinTrack runs Monte Carlo simulations on both:

1. The user's current portfolio
2. The optimized portfolio

The simulation estimates future portfolio value paths and displays:

* Median portfolio path
* 5th percentile downside scenario
* 95th percentile upside scenario
* Expected final portfolio value
* Probability of loss
* Downside risk estimate

This helps users compare the risk-return behavior of their current allocation against the optimized allocation.

---

### Stock Price Prediction

FinTrack integrates a self-built ML stock prediction model.

Deployed model test endpoint:

```txt
https://stock-analyser-ggjy.onrender.com/predict/MSFT
```

Replace `MSFT` with any stock ticker.

Example:

```txt
https://stock-analyser-ggjy.onrender.com/predict/AAPL
https://stock-analyser-ggjy.onrender.com/predict/NVDA
```

The prediction module allows users to estimate the future movement or expected value of a listed stock using the deployed model API.

---

### AI Finance Chatbot

FinTrack includes an AI-powered finance assistant using OpenAI's API.

The chatbot can help users with:

* Financial concepts
* Stock market questions
* Portfolio-related queries
* Trading explanations
* Investment terminology
* General finance guidance

---

### Watchlist & Notifications

The dashboard includes watchlist and notification support.

Current notification endpoint:

```txt
GET /api/notifications/unread-count
```

At the current stage, the unread notification route returns:

```json
{
  "count": 0
}
```

This prevents dashboard fetch errors and keeps the UI ready for a future notification system.

---

## Tech Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Frontend        | React, Vite, Tailwind CSS, Bootstrap  |
| Backend         | Node.js, Express.js                   |
| Database        | MongoDB, Mongoose                     |
| Authentication  | JWT, bcrypt, cookies                  |
| Market Data API | AlphaVantage API                      |
| AI Assistant    | OpenAI API                            |
| ML Prediction   | Deployed FastAPI model on Render      |
| Quant Service   | Python, FastAPI, NumPy, Pandas, SciPy |
| Charts          | Recharts                              |
| Icons           | Lucide React                          |

---

## Project Structure

```txt
Fin-track/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuantOptimizer.jsx
│   │   │   ├── BuySell.jsx
│   │   │   ├── Invested.jsx
│   │   │   ├── Returns.jsx
│   │   │   ├── ProfitLoss.jsx
│   │   │   ├── MarketAnalytics.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   ├── MailNotifications.jsx
│   │   │   ├── Signin.jsx
│   │   │   └── Signup.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── portfolio.js
│   │   ├── market.js
│   │   ├── trades.js
│   │   ├── userRoutes.js
│   │   ├── watchlist.js
│   │   ├── notificationRoutes.js
│   │   └── quantRoutes.js
│   ├── utils/
│   │   ├── calculateCurrentWeights.js
│   │   └── fetchHistoricalPrices.js
│   ├── index.js
│   └── package.json
│
├── quant_service/
│   ├── main.py
│   ├── optimizer.py
│   ├── run.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Server `.env`

Create a `.env` file inside the `server/` folder.

```env
PORT=3002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

QUANT_SERVICE_URL=http://localhost:8000
ALPHA_VANTAGE_API_KEY=your_alphavantage_api_key
```

Important: never commit `.env` files to GitHub.

---

### Client `.env`

Create a `.env` file inside the `client/` folder.

```env
VITE_BACKEND_URL=http://localhost:3002
VITE_ALPHA_VANTAGE_KEY=your_alphavantage_api_key
VITE_PREDICTION_API_URL=https://stock-analyser-ggjy.onrender.com
```

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/vtyagi26/FinTrack.git
cd FinTrack/Fin-track
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```txt
http://localhost:3002
```

Health check:

```txt
http://localhost:3002/
```

Expected response:

```txt
API running...
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

---

## Quant Service Setup

The quant optimizer runs as a separate Python FastAPI microservice.

```bash
cd quant_service
python -m venv venv
```

Activate virtual environment.

On Windows:

```bash
venv\Scripts\activate
```

On Mac/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the service:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The quant service runs on:

```txt
http://localhost:8000
```

Swagger docs:

```txt
http://localhost:8000/docs
```

---

## Running the Full App

You need to run three servers in separate terminals.

### Terminal 1: Quant Service

```bash
cd quant_service
venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: Backend

```bash
cd server
npm run dev
```

### Terminal 3: Frontend

```bash
cd client
npm run dev
```

Then open:

```txt
http://localhost:5173
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | `/api/auth/signup` | Register new user     |
| POST   | `/api/auth/login`  | Login user            |
| POST   | `/api/auth/logout` | Logout user           |
| GET    | `/api/auth/verify` | Verify logged-in user |

---

### Portfolio

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| GET    | `/api/portfolio`           | Get portfolio data |
| GET    | `/api/portfolio/holdings`  | Get user holdings  |
| GET    | `/api/portfolio/positions` | Get user positions |

---

### Trades

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| POST   | `/api/trades` | Place buy/sell trade |
| GET    | `/api/trades` | Fetch trade history  |

---

### Market

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/market` | Fetch market data |

---

### Watchlist

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/watchlist`     | Get watchlist               |
| POST   | `/api/watchlist`     | Add stock to watchlist      |
| DELETE | `/api/watchlist/:id` | Remove stock from watchlist |

---

### Notifications

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/notifications/unread-count` | Get unread notification count |

---

### Quant Optimizer

| Method | Endpoint          | Description                                           |
| ------ | ----------------- | ----------------------------------------------------- |
| POST   | `/quant/optimize` | Run portfolio optimization and Monte Carlo simulation |

Example request:

```json
{
  "holdings": [
    {
      "ticker": "AAPL",
      "quantity": 10,
      "currentPrice": 180
    },
    {
      "ticker": "MSFT",
      "quantity": 5,
      "currentPrice": 420
    },
    {
      "ticker": "NVDA",
      "quantity": 2,
      "currentPrice": 900
    }
  ],
  "riskFreeRate": 0.06,
  "horizonDays": 252,
  "simulations": 1000
}
```

Example response:

```json
{
  "currentPortfolio": {
    "weights": {
      "AAPL": 0.3158,
      "MSFT": 0.3684,
      "NVDA": 0.3158
    },
    "expectedReturn": 0.12,
    "volatility": 0.2,
    "sharpeRatio": 0.3,
    "finalExpectedValue": 112000
  },
  "optimalPortfolio": {
    "weights": {
      "AAPL": 0.25,
      "MSFT": 0.35,
      "NVDA": 0.4
    },
    "expectedReturn": 0.16,
    "volatility": 0.18,
    "sharpeRatio": 0.55,
    "finalExpectedValue": 116000
  },
  "rebalance": [
    {
      "ticker": "AAPL",
      "currentWeight": 0.3158,
      "optimalWeight": 0.25,
      "difference": -0.0658,
      "action": "SELL"
    }
  ],
  "monteCarlo": {
    "current": {
      "graph": [],
      "summary": {}
    },
    "optimal": {
      "graph": [],
      "summary": {}
    }
  }
}
```

---

## Quant Optimizer Architecture

```txt
React Dashboard
      ↓
Express Backend
      ↓
Convert holdings into current weights
      ↓
Fetch historical prices using AlphaVantage
      ↓
FastAPI Quant Microservice
      ↓
Markowitz optimization + Monte Carlo simulation
      ↓
Return optimal allocation, risk metrics, graphs
      ↓
Render results in React dashboard
```

---

## Quant Optimization Methodology

The optimizer calculates:

* Daily returns from historical closing prices
* Annualized expected returns
* Annualized covariance matrix
* Portfolio expected return
* Portfolio volatility
* Sharpe ratio
* Maximum Sharpe ratio allocation
* Current portfolio performance
* Optimized portfolio performance
* Rebalancing difference

The optimization objective is to maximize the Sharpe ratio:

```txt
Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
```

---

## Monte Carlo Methodology

Monte Carlo simulation is used to estimate possible future portfolio value paths.

The simulation uses:

* Initial portfolio value
* Expected annual return
* Annual volatility
* Trading-day time step
* Random normal shocks
* Multiple simulation paths

The simulator outputs percentile paths such as:

* 5th percentile
* Median
* 95th percentile

These are visualized in the dashboard using Recharts.

---

## Screens / Dashboard Pages

FinTrack includes the following pages:

* Landing page
* Sign in
* Sign up
* Dashboard home
* Watchlist
* Invested holdings
* Returns
* Buy/Sell
* Transaction history
* AI Assistant
* Prediction Agent
* Quant Optimizer
* Mail Notifications

---

## Deployment Notes

### Prediction Model

The prediction model is deployed on Render.

Example endpoint:

```txt
https://stock-analyser-ggjy.onrender.com/predict/MSFT
```

### Quant Service

The quant service can also be deployed as a FastAPI service.

Recommended Render start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

If the service is structured as `app/main.py`, use:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## GitHub Notes

Do not commit:

```txt
.env
venv/
node_modules/
dist/
build/
__pycache__/
```

Only commit:

```txt
requirements.txt
package.json
package-lock.json
source code files
README.md
```

---

## Future Improvements

* Connect notification system with MongoDB
* Add email alerts for price limits
* Add efficient frontier visualization
* Add portfolio beta calculation
* Add maximum drawdown calculation
* Add Value at Risk and Conditional Value at Risk
* Add sector diversification analysis
* Add Indian market support
* Add options pricing using Black-Scholes and CRR model
* Add live broker integration
* Deploy quant optimizer microservice separately
* Store optimization results in user history

---

## Acknowledgements

* Market data powered by AlphaVantage
* UI built with React, Tailwind CSS, Bootstrap, and Recharts
* Backend powered by Node.js, Express, and MongoDB
* Quant analytics powered by Python, FastAPI, NumPy, Pandas, and SciPy
* AI assistant powered by OpenAI API
* ML prediction service deployed on Render

---

## Maintainer

**Vaibhav Tyagi**

GitHub: [vtyagi26](https://github.com/vtyagi26)
