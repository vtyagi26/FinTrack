import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getQuote, getBatchQuotes } from "../controllers/marketController.js";

const router = express.Router();

router.get("/quotes", getBatchQuotes);
router.get("/quote", protect, getQuote);

export default router;
