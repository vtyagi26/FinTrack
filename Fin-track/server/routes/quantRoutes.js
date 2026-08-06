import express from "express";
import axios from "axios";

import calculateCurrentWeights from "../utils/calculateCurrentWeights.js";
import fetchHistoricalPrices from "../utils/fetchHistoricalPrices.js";

const router = express.Router();

const QUANT_SERVICE_URL =
  process.env.QUANT_SERVICE_URL || "http://localhost:8000";

// Health check — lets the frontend verify the quant service is reachable
router.get("/health", async (req, res) => {
  console.log(`[Quant Health] Pinging quant service at: ${QUANT_SERVICE_URL}`);
  try {
    const response = await axios.get(`${QUANT_SERVICE_URL}/`, { timeout: 8000 });
    return res.status(200).json({
      status: "ok",
      quantServiceUrl: QUANT_SERVICE_URL,
      quantServiceResponse: response.data,
    });
  } catch (error) {
    const isConnRefused = error.code === "ECONNREFUSED";
    return res.status(503).json({
      status: "unreachable",
      quantServiceUrl: QUANT_SERVICE_URL,
      error: isConnRefused
        ? `Cannot connect to quant service at ${QUANT_SERVICE_URL}. Is the Python uvicorn server running?`
        : error.message,
    });
  }
});

router.post("/optimize", async (req, res) => {
  console.log(`[Quant Optimize] Using QUANT_SERVICE_URL: ${QUANT_SERVICE_URL}`);

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

    console.log(`[Quant Optimize] Calling Python service: ${QUANT_SERVICE_URL}/optimize`);
    console.log(`[Quant Optimize] Tickers: ${tickers.join(", ")}, Capital: $${totalValue}`);

    const response = await axios.post(
      `${QUANT_SERVICE_URL}/optimize`,
      quantPayload,
      { timeout: 90000 } // 90s — Render free tier cold boot can take ~50s
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Quant optimization error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      quantServiceUrl: QUANT_SERVICE_URL,
      data: typeof error.response?.data === "string"
        ? error.response.data.slice(0, 300)
        : error.response?.data,
    });

    const isHtmlError =
      typeof error.response?.data === "string" &&
      (error.response.data.includes("<html") || error.response.data.includes("<!DOCTYPE"));

    let friendlyError = "Failed to run portfolio optimizer.";

    if (error.code === "ECONNREFUSED") {
      friendlyError = `Cannot connect to the Quant Service at "${QUANT_SERVICE_URL}". ` +
        `If running locally, start the Python server: cd quant_service && python run.py. ` +
        `If deployed on Render, set the QUANT_SERVICE_URL environment variable to your Python service's Render URL.`;
    } else if (error.response?.status === 502 || isHtmlError) {
      friendlyError =
        `The Quant Service at "${QUANT_SERVICE_URL}" returned a 502 Bad Gateway. ` +
        `If deployed on Render, the Python microservice may be sleeping — try again in 30 seconds. ` +
        `Also verify QUANT_SERVICE_URL is set correctly in your server environment variables.`;
    } else if (error.response?.data?.detail) {
      friendlyError = error.response.data.detail;
    } else if (typeof error.response?.data === "string" && !isHtmlError) {
      friendlyError = error.response.data;
    } else if (error.message) {
      friendlyError = error.message;
    }

    return res.status(500).json({
      message: "Failed to optimize portfolio",
      error: friendlyError,
      quantServiceUrl: QUANT_SERVICE_URL,
    });
  }
});

export default router;