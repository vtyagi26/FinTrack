import Watchlist from "../models/Watchlist.js";

// @desc    Add stock to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, upperLimit, lowerLimit } = req.body;

    const exists = await Watchlist.findOne({ user: req.user._id, symbol });
    if (exists) return res.status(400).json({ message: "Stock already in watchlist" });

    const watchItem = await Watchlist.create({
      user: req.user._id,
      symbol: symbol.toUpperCase(),
      upperLimit: upperLimit || null,
      lowerLimit: lowerLimit || null,
    });

    res.status(201).json(watchItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user watchlist
export const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Remove from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const watchItem = await Watchlist.findById(req.params.id);
    if (!watchItem || watchItem.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Item not found" });
    }
    await watchItem.deleteOne();
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};