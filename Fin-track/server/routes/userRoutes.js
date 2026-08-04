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
      if (typeof user.balance !== "number" || isNaN(user.balance)) {
        user.balance = 5000;
        await user.save();
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-balance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance = 5000;
    await user.save();
    res.json({ message: "Budget successfully reset to $5,000", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error resetting budget" });
  }
});

export default router;