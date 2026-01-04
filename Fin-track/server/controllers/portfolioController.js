import Holding from "../models/Holding.js";

// GET /api/portfolio/summary
export const getSummary = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });

    let invested = 0;
    let currentValue = 0;

    holdings.forEach((h) => {
      invested += h.avgCost * h.quantity;
      currentValue += h.currentPrice * h.quantity;
    });

    const unrealizedPnL = currentValue - invested;

    res.json({
      invested,
      currentValue,
      unrealizedPnL,
      realizedPnL: 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching summary" });
  }
};

// GET /api/portfolio/holdings
export const getHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });
    res.json(
      holdings.map((h) => ({
        symbol: h.symbol,
        quantity: h.quantity,
        avgCost: h.avgCost,
        currentPrice: h.currentPrice,
        unrealizedPnL: (h.currentPrice - h.avgCost) * h.quantity,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Error fetching holdings" });
  }
};

// GET /api/portfolio/snapshots?range=30d
export const getSnapshots = async (req, res) => {
  try {
    const { range = "30d" } = req.query;

    const days = parseInt(range.replace(/\D/g, ""), 10); // ✅ fix

    const snapshots = [];
    for (let i = days; i >= 0; i--) {
      snapshots.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        value: 100000 + Math.floor(Math.random() * 20000),
      });
    }

    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching snapshots" });
  }
};