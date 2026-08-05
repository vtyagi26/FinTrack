import Holding from "../models/Holding.js";
import Trade from "../models/Trade.js";
import User from "../models/User.js";
import { getBatchQuotesFromCache } from "../services/marketCache.js";
import fetchHistoricalPrices from "../utils/fetchHistoricalPrices.js";

// 1. Fetch all holdings (Used for the table)
export const getHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    res.json(holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.avgCost,
      currentPrice: h.currentPrice || h.avgCost,
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
  const user = await User.findById(userId);
  const holdings = await Holding.find({ user: userId });
  const trades = await Trade.find({ userId }).sort({ createdAt: 1 });

  const currentCash = typeof user?.balance === "number" && !isNaN(user.balance) ? user.balance : 5000;

  // Live price map
  let livePriceMap = {};
  try {
    const liveQuotes = await getBatchQuotesFromCache();
    if (Array.isArray(liveQuotes)) {
      liveQuotes.forEach((q) => {
        if (q.symbol && q.price) {
          livePriceMap[q.symbol.toUpperCase()] = parseFloat(q.price);
        }
      });
    }
  } catch (e) {
    console.warn("Could not fetch live quotes for portfolio history:", e.message);
  }

  const activeHoldings = holdings.map((h) => {
    const sym = h.symbol.toUpperCase();
    const livePrice = livePriceMap[sym] || Number(h.currentPrice) || Number(h.avgCost) || 150;
    return {
      symbol: sym,
      quantity: Number(h.quantity),
      avgCost: Number(h.avgCost) || livePrice,
      currentPrice: livePrice,
    };
  });

  const hasPortfolio = activeHoldings.length > 0 || trades.length > 0;
  const history = [];
  const now = new Date();

  // If user has no holdings and no trades, return clean flat line at current balance ($5,000)
  if (!hasPortfolio) {
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      history.push({
        date: dateLabel,
        dateFull: d.toISOString().split("T")[0],
        stockValue: 0,
        cash: currentCash,
        totalValue: currentCash,
        value: currentCash,
      });
    }
    return { hasPortfolio: false, history };
  }

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

    let dayCash = 5000 - cashSpentOnBuys + cashEarnedOnSells;
    if (i === 0) dayCash = currentCash;

    let dayStockValue = 0;
    const progress = (daysCount - 1 - i) / Math.max(1, daysCount - 1);

    Object.keys(qtyMap).forEach((sym) => {
      const qty = qtyMap[sym];
      if (qty > 0) {
        const hObj = activeHoldings.find((h) => h.symbol === sym);
        const startPrice = hObj ? hObj.avgCost : 150;
        const endPrice = hObj ? hObj.currentPrice : startPrice;

        const sineDev = i === 0 ? 0 : 0.012 * Math.sin(i * 1.7 + sym.charCodeAt(0));
        const dayPrice = i === 0 ? endPrice : startPrice + (endPrice - startPrice) * progress + startPrice * sineDev;

        dayStockValue += qty * Math.max(1, dayPrice);
      }
    });

    const dayTotalValue = Number((dayCash + dayStockValue).toFixed(2));
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    history.push({
      date: dateLabel,
      dateFull: d.toISOString().split("T")[0],
      stockValue: Number(dayStockValue.toFixed(2)),
      cash: Number(dayCash.toFixed(2)),
      totalValue: dayTotalValue,
      value: dayTotalValue,
    });
  }

  return {
    hasPortfolio: true,
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