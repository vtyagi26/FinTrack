import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getQuote, getBatchQuotes, bustCache, getDebug } from "../controllers/marketController.js";

const router = express.Router();

router.get("/quotes", getBatchQuotes);
router.get("/quote", protect, getQuote);

// Public debug endpoint — no auth required so you can hit it directly in a browser
// GET /api/market/debug → shows env vars, cache state, last AlphaVantage call result
router.get("/debug", getDebug);

// Force-clear cache (protected — requires login token)
router.post("/cache/clear", protect, bustCache);

export default router;
