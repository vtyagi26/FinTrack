import Holding from "../models/Holding.js";
import Trade from "../models/Trade.js";
import fetchHistoricalPrices from "../utils/fetchHistoricalPrices.js";

// 1. Fetch all holdings (Used for the table)
export const getHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    res.json(holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.avgCost,
      currentPriceAtTrade: h.currentPrice,
    })));
  } catch (err) {
    res.status(500).json({ message: "Error fetching holdings from MongoDB" });
  }
};

// 2. Fetch Portfolio Summary (Total Invested)
export const getSummary = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });

    let invested = 0;
    holdings.forEach((h) => {
      invested += h.avgCost * h.quantity;
    });

    res.json({
      invested,
      currentValue: invested, // This will be updated by frontend live prices
      unrealizedPnL: 0,
      realizedPnL: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};

// Helper: Calculate multi-day cumulative portfolio value history (Cash + Stock Value)
async function calculatePortfolioHistory(userId, daysCount = 30) {
  const holdings = await Holding.find({ user: userId });
  const trades = await Trade.find({ userId }).sort({ createdAt: 1 });

  const priceMap = {};
  holdings.forEach((h) => {
    if (h.currentPrice || h.avgCost) {
      priceMap[h.symbol.toUpperCase()] = h.currentPrice || h.avgCost;
    }
  });

  const symbolSet = new Set([
    ...holdings.map((h) => h.symbol.toUpperCase()),
    ...trades.map((t) => t.symbol.toUpperCase()),
  ]);
  const symbols = Array.from(symbolSet);

  const historicalMap = await fetchHistoricalPrices(symbols, priceMap);

  const history = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const tradesUpToDay = trades.filter(
      (t) => new Date(t.createdAt).getTime() <= dayEnd.getTime()
    );

    const qtyMap = {};
    let cashSpentOnBuys = 0;
    let cashEarnedOnSells = 0;

    tradesUpToDay.forEach((t) => {
      const sym = t.symbol.toUpperCase();
      if (!qtyMap[sym]) qtyMap[sym] = 0;

      if (t.type === "buy") {
        qtyMap[sym] += Number(t.quantity);
        cashSpentOnBuys += Number(t.quantity) * Number(t.price);
      } else if (t.type === "sell") {
        qtyMap[sym] = Math.max(0, qtyMap[sym] - Number(t.quantity));
        cashEarnedOnSells += Number(t.quantity) * Number(t.price);
      }
    });

    let stockValue = 0;
    symbols.forEach((sym) => {
      const qty = qtyMap[sym] || 0;
      if (qty > 0) {
        const prices = historicalMap[sym] || [];
        const priceIndex = prices.length >= daysCount ? prices.length - 1 - i : prices.length - 1;
        const dayPrice = prices[priceIndex] || priceMap[sym] || 150;
        stockValue += qty * dayPrice;
      }
    });

    const cash = 5000 - cashSpentOnBuys + cashEarnedOnSells;
    const totalPortfolioValue = Number((stockValue + cash).toFixed(2));
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    history.push({
      date: dateLabel,
      dateFull: d.toISOString().split("T")[0],
      stockValue: Number(stockValue.toFixed(2)),
      cash: Number(cash.toFixed(2)),
      totalValue: totalPortfolioValue,
      value: totalPortfolioValue,
    });
  }

  return {
    hasPortfolio: holdings.length > 0 || trades.length > 0,
    history,
  };
}

// 3. Fetch Portfolio History Snapshots (For the chart)
export const getSnapshots = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const days = parseInt(range.replace(/\D/g, ""), 10) || 30;

    const { history } = await calculatePortfolioHistory(req.user._id, days);
    res.json(history);
  } catch (err) {
    console.error("GET SNAPSHOTS ERROR:", err);
    res.status(500).json({ message: "Error fetching snapshots", error: err.message });
  }
};

// 4. Calculate 7-Day Cumulative Portfolio Performance
export const getPerformance7d = async (req, res) => {
  try {
    const { hasPortfolio, history } = await calculatePortfolioHistory(req.user._id, 7);
    res.json({
      hasPortfolio,
      performance: history,
    });
  } catch (err) {
    console.error("GET 7D PERFORMANCE ERROR:", err);
    res.status(500).json({ message: "Error calculating 7-day performance", error: err.message });
  }
};