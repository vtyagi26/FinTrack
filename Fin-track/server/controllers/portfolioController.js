// controllers/portfolioController.js
import Holding from "../models/Holding.js";

export const getHoldings = async (req, res) => {
  try {
    // Finds all holdings belonging to the logged-in user
    const holdings = await Holding.find({ user: req.user._id });
    
    res.json(holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.avgCost,
      currentPriceAtTrade: h.currentPrice, // This was the price when they last traded
    })));
  } catch (err) {
    res.status(500).json({ message: "Error fetching holdings from MongoDB" });
  }
};