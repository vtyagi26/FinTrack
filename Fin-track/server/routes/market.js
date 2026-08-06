import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getQuote, getBatchQuotes, bustCache } from "../controllers/marketController.js";

const router = express.Router();

router.get("/quotes", getBatchQuotes);
router.get("/quote", protect, getQuote);

// Force a fresh fetch from AlphaVantage (e.g. after rotating the API key)
router.post("/cache/clear", protect, bustCache);

export default router;
