import Holding from "../models/Holding.js";
import User from "../models/User.js";
import Trade from "../models/Trade.js";

export const getTradeHistory = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(trades);
  } catch (err) {
    console.error("GET TRADE HISTORY ERROR:", err);

    res.status(500).json({
      message: "Error fetching trade history",
      error: err.message,
    });
  }
};

export const executeTrade = async (req, res) => {
  try {
    const { symbol, quantity, price, type } = req.body;

    console.log("\n================= NEW TRADE =================");
    console.log("BODY:", req.body);

    const userId = req.user._id;

    console.log("\n========== AUTH USER ==========");
    console.log(req.user);

    const user = await User.findById(userId);

    console.log("\n========== USER FROM DB ==========");
    console.log(user);

    if (user) {
      console.log(user.toObject());
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (typeof user.balance !== "number" || isNaN(user.balance) || user.balance == null) {
      user.balance = 5000;
    }

    let holding = await Holding.findOne({
      user: userId,
      symbol: symbol.toUpperCase(),
    });

    console.log("\n========== HOLDING ==========");
    console.log(holding);

    let realizedPnLForThisTrade = 0;

    if (type === "buy") {
      const totalCost = Number(quantity) * Number(price);

      console.log("\n========== BUY ==========");
      console.log({
        balance: user.balance,
        totalCost,
      });

      if (user.balance < totalCost) {
        return res.status(400).json({
          message: "Insufficient balance to complete purchase",
        });
      }

      user.balance -= totalCost;

      if (holding) {
        const oldTotalCost = holding.quantity * holding.avgCost;
        const newTotalQuantity = holding.quantity + Number(quantity);

        holding.avgCost =
          (oldTotalCost + totalCost) / newTotalQuantity;

        holding.quantity = newTotalQuantity;
        holding.currentPrice = Number(price);

        console.log("\nUpdating Holding...");
        console.log(holding.toObject());

        await holding.save();

        console.log("Holding updated.");
      } else {
        console.log("\nCreating Holding...");

        const newHolding = await Holding.create({
          user: userId,
          symbol: symbol.toUpperCase(),
          quantity: Number(quantity),
          avgCost: Number(price),
          currentPrice: Number(price),
        });

        console.log(newHolding);
      }
    }

    else if (type === "sell") {

      console.log("\n========== SELL ==========");

      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({
          message: "Insufficient shares to sell",
        });
      }

      realizedPnLForThisTrade =
        (Number(price) - holding.avgCost) * Number(quantity);

      user.balance += Number(quantity) * Number(price);

      holding.quantity -= Number(quantity);

      if (holding.quantity === 0) {
        console.log("Deleting holding...");
        await holding.deleteOne();
      } else {
        console.log("Updating holding...");
        await holding.save();
      }
    }

    console.log("\n========== CREATING TRADE ==========");

    console.log({
      userId,
      symbol,
      quantity,
      price,
      type,
      realizedPnL: realizedPnLForThisTrade,
    });

    const trade = await Trade.create({
      userId,
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
      type,
      realizedPnL: realizedPnLForThisTrade,
    });

    console.log(trade);

console.log("USER BEFORE SAVE:");
console.log(user.toObject());

    await User.findByIdAndUpdate(userId, { balance: user.balance });
    console.log("User balance saved successfully to MongoDB:", user.balance);

    console.log("================= TRADE COMPLETE =================\n");

    res.status(200).json({
      message: "Trade successful",
      userBalance: user.balance,
      realizedPnL: realizedPnLForThisTrade,
    });

  } catch (err) {

    console.log("\n================= TRADE ERROR =================");

    console.error(err);

    console.error(err.stack);

    console.log("===============================================\n");

    res.status(500).json({
      message: "Trade failed",
      error: err.message,
    });
  }
};