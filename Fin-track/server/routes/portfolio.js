import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSummary,
  getHoldings,
  getSnapshots,
  getPerformance7d,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/summary", protect, getSummary);
router.get("/holdings", protect, getHoldings);
router.get("/snapshots", protect, getSnapshots);
router.get("/performance", protect, getPerformance7d);

export default router;