// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Get profile
router.get("/profile", protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof user.balance !== "number" || isNaN(user.balance)) {
      await User.findByIdAndUpdate(req.user._id, { balance: 5000 });
      user.balance = 5000;
    }
    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// Reset budget to $5,000 in MongoDB
router.post("/reset-balance", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { balance: 5000 },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Budget successfully reset to $5,000", balance: user.balance });
  } catch (err) {
    console.error("RESET BALANCE ERROR:", err);
    res.status(500).json({ message: "Server error resetting budget" });
  }
});

// Update budget to custom amount in MongoDB
router.post("/update-balance", protect, async (req, res) => {
  try {
    const { balance } = req.body;
    const newBalance = Number(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      return res.status(400).json({ message: "Invalid budget amount" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { balance: newBalance },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Budget successfully updated", balance: user.balance });
  } catch (err) {
    console.error("UPDATE BALANCE ERROR:", err);
    res.status(500).json({ message: "Server error updating budget" });
  }
});

export default router;