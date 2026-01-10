// controllers/tradeController.js
import Holding from "../models/Holding.js";
import User from "../models/User.js";
import Trade from "../models/Trade.js";

export const getTradeHistory = async (req, res) => {
  try {
    // Find all trades for the logged-in user, sorted by newest first
    const trades = await Trade.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(trades);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trade history", error: err.message });
  }
};

// controllers/tradeController.js
export const executeTrade = async (req, res) => {
  try {
    const { symbol, quantity, price, type } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    let holding = await Holding.findOne({ user: userId, symbol: symbol.toUpperCase() });
    let realizedPnLForThisTrade = 0;

    if (type === "buy") {
      // ... your existing Buy logic (updates balance and avgCost) ...
    } 
    
    else if (type === "sell") {
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient shares to sell" });
      }

      // --- CALCULATE REALIZED P/L ---
      // Realized P/L = (Current Sell Price - The price you paid on average) * Quantity
      realizedPnLForThisTrade = (price - holding.avgCost) * quantity;

      user.balance += (quantity * price);
      holding.quantity -= quantity;

      if (holding.quantity === 0) {
        await holding.deleteOne();
      } else {
        await holding.save();
      }
    }

    // Save the trade to history with the calculated Realized P/L
    await Trade.create({
      userId,
      symbol: symbol.toUpperCase(),
      quantity,
      price,
      type,
      realizedPnL: realizedPnLForThisTrade // Store this for the History page
    });

    await user.save();

    res.status(200).json({ 
      message: "Trade successful", 
      userBalance: user.balance,
      realizedPnL: realizedPnLForThisTrade 
    });
  } catch (err) {
    res.status(500).json({ message: "Trade failed", error: err.message });
  }
};