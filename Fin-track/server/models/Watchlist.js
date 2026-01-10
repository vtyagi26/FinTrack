// models/Watchlist.js
import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  upperLimit: { type: Number },
  lowerLimit: { type: Number },
}, { timestamps: true });

// Ensure a user can only add a stock once
watchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

export default mongoose.model("Watchlist", watchlistSchema);