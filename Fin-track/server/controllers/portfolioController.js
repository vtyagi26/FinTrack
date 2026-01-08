import Holding from "../models/Holding.js";

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

// 3. Fetch Portfolio History Snapshots (For the chart)
export const getSnapshots = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const days = parseInt(range.replace(/\D/g, ""), 10) || 30;

    const snapshots = [];
    for (let i = days; i >= 0; i--) {
      snapshots.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        value: 10000 + Math.floor(Math.random() * 2000), // Placeholder data for now
      });
    }

    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching snapshots" });
  }
};