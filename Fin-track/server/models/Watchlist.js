import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  upperLimit: { type: Number },
  lowerLimit: { type: Number },
}, { timestamps: true });

// Ensure a user can't add the same stock twice
watchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", watchlistSchema);
export default Watchlist;