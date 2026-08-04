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
      quantPayload,
      { timeout: 15000 }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Quant optimization error full:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: typeof error.response?.data === "string" ? error.response.data.slice(0, 200) : error.response?.data
    });

    const isHtmlError =
      typeof error.response?.data === "string" &&
      (error.response.data.includes("<html") || error.response.data.includes("<!DOCTYPE"));

    let friendlyError = "Failed to run portfolio optimizer.";

    if (error.response?.status === 502 || isHtmlError) {
      friendlyError =
        "Quant Optimization service is currently unavailable (502 Bad Gateway). If deployed on Render, the Python microservice may be waking up from sleep. Please try again in 30 seconds.";
    } else if (error.code === "ECONNREFUSED") {
      friendlyError =
        "Cannot connect to Quant Optimization microservice at " +
        QUANT_SERVICE_URL +
        ". Please ensure the Python uvicorn service is running.";
    } else if (error.response?.data?.detail) {
      friendlyError = error.response.data.detail;
    } else if (typeof error.response?.data === "string" && !isHtmlError) {
      friendlyError = error.response.data;
    } else if (error.message) {
      friendlyError = error.message;
    }

    return res.status(500).json({
      message: "Failed to optimize portfolio",
      error: friendlyError
    });
  }
});

export default router;