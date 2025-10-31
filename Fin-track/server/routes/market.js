import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getQuote } from "../controllers/marketController.js";

const router = express.Router();

router.get("/quote", protect, getQuote);

export default router;
