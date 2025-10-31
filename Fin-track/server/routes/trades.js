import express from "express";
import Trade from "../models/Trade.js";
const router = express.Router();

// Save trade (Buy or Sell)
router.post("/", async (req, res) => {
  try {
    const { userId, symbol, quantity, price, type } = req.body;
    const trade = new Trade({ userId, symbol, quantity, price, type });
    await trade.save();
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user trades
router.get("/:userId", async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.params.userId });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
