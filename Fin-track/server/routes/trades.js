import express from "express";
import { executeTrade, getTradeHistory } from "../controllers/tradeController.js";
import { protect } from "../middleware/authMiddleware.js"; // Ensure user is logged in

const router = express.Router();
router.post("/", protect, executeTrade);
router.get("/history", protect, getTradeHistory);

export default router;