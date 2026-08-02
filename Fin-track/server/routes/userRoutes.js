// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

import Trade from "../models/Trade.js";

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      const tradeCount = await Trade.countDocuments({ userId: user._id });
      if (tradeCount === 0 && user.balance !== 5000) {
        user.balance = 5000;
        await user.save();
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;