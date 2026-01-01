import express from "express";
import { executeTrade } from "../controllers/tradeController.js";
import { protect } from "../middleware/authMiddleware.js"; // Ensure user is logged in

const router = express.Router();
router.post("/", protect, executeTrade);

export default router;