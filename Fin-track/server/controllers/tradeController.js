import Holding from "../models/Holding.js";
// Optional: Import a Transaction model if you want to keep history
// import Transaction from "../models/Transaction.js"; 

export const executeTrade = async (req, res) => {
  try {
    const { symbol, quantity, price, type } = req.body;
    const userId = req.user._id;

    // 1. Find if the user already has a holding for this symbol
    let holding = await Holding.findOne({ user: userId, symbol: symbol.toUpperCase() });

    if (type === "buy") {
      if (holding) {
        // Calculate new Average Cost:
        // Formula: $AvgCost = \frac{(CurrentQty \times CurrentAvgCost) + (NewQty \times NewPrice)}{CurrentQty + NewQty}$
        const totalOldCost = holding.quantity * holding.avgCost;
        const totalNewCost = quantity * price;
        const newTotalQuantity = holding.quantity + quantity;
        
        holding.avgCost = (totalOldCost + totalNewCost) / newTotalQuantity;
        holding.quantity = newTotalQuantity;
        holding.currentPrice = price; // Update the price to latest
      } else {
        // Create new holding
        holding = new Holding({
          user: userId,
          symbol: symbol.toUpperCase(),
          quantity,
          avgCost: price,
          currentPrice: price,
        });
      }
    } 
    
    else if (type === "sell") {
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient quantity to sell" });
      }

      holding.quantity -= quantity;
      holding.currentPrice = price;

      // If quantity hits 0, you can either delete the holding or keep it with 0
      if (holding.quantity === 0) {
        await holding.deleteOne();
        return res.json({ message: "Trade successful, holding closed" });
      }
    }

    await holding.save();

    // Optional: Log this into a Transactions collection here...

    res.status(200).json({ message: "Trade executed successfully", holding });
  } catch (err) {
    res.status(500).json({ message: "Trade execution failed", error: err.message });
  }
};