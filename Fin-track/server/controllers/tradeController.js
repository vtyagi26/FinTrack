// controllers/tradeController.js
import Holding from "../models/Holding.js";
import User from "../models/User.js";
import Trade from "../models/Trade.js";

export const executeTrade = async (req, res) => {
  try {
    const { symbol, quantity, price, type } = req.body;
    const userId = req.user._id;

    // 1. Get the User from MongoDB to check balance
    const user = await User.findById(userId);
    const totalTradeValue = quantity * price;

    // 2. Buy Logic: Check if user has enough cash
    if (type === "buy") {
      if (user.balance < totalTradeValue) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.balance -= totalTradeValue;
    } 
    
    // 3. Sell Logic: Check if user has enough shares
    else if (type === "sell") {
      user.balance += totalTradeValue;
    }

    // 4. Update Holding logic (Same as you had, but wrapped in this flow)
    let holding = await Holding.findOne({ user: userId, symbol: symbol.toUpperCase() });

    if (type === "buy") {
      if (holding) {
        const totalOldCost = holding.quantity * holding.avgCost;
        const totalNewCost = quantity * price;
        const newTotalQuantity = holding.quantity + quantity;
        holding.avgCost = (totalOldCost + totalNewCost) / newTotalQuantity;
        holding.quantity = newTotalQuantity;
      } else {
        holding = new Holding({
          user: userId,
          symbol: symbol.toUpperCase(),
          quantity,
          avgCost: price,
          currentPrice: price,
        });
      }
      await holding.save();
    } else {
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient shares to sell" });
      }
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        await holding.deleteOne();
      } else {
        await holding.save();
      }
    }

    // 5. Create a Trade Log (History)
    await Trade.create({
      userId,
      symbol: symbol.toUpperCase(),
      quantity,
      price,
      type
    });

    // 6. Save the user's new balance
    await user.save();

    res.status(200).json({ 
      message: "Trade successful", 
      userBalance: user.balance // Return new balance to frontend
    });

  } catch (err) {
    res.status(500).json({ message: "Trade failed", error: err.message });
  }
};