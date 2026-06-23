import express from "express";
import axios from "axios";

import calculateCurrentWeights from "../utils/calculateCurrentWeights.js";
import fetchHistoricalPrices from "../utils/fetchHistoricalPrices.js";

const router = express.Router();

const QUANT_SERVICE_URL =
  process.env.QUANT_SERVICE_URL || "http://localhost:8000";

router.post("/optimize", async (req, res) => {
  try {
    const {
      holdings,
      riskFreeRate = 0.06,
      horizonDays = 252,
      simulations = 1000
    } = req.body;

    const {
      currentWeights,
      totalValue,
      tickers
    } = calculateCurrentWeights(holdings);

    const prices = await fetchHistoricalPrices(tickers);

    const quantPayload = {
      initialCapital: totalValue,
      riskFreeRate,
      horizonDays,
      simulations,
      currentWeights,
      prices
    };

    const response = await axios.post(
      `${QUANT_SERVICE_URL}/optimize`,
      quantPayload
    );

    return res.status(200).json(response.data);
} catch (error) {
  console.error("Quant optimization error full:", {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  });

  return res.status(500).json({
    message: "Failed to optimize portfolio",
    error: error.response?.data || error.message
  });
}

});

export default router;