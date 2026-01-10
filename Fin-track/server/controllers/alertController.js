// controllers/alertController.js
import Watchlist from "../models/Watchlist.js";
import Notification from "../models/Notification.js";

export const checkAlerts = async (req, res) => {
  const { currentPrices } = req.body; // Expecting { AAPL: 180, TSLA: 250 }
  const userId = req.user._id;

  try {
    const watchlist = await Watchlist.find({ user: userId });
    const alertsCreated = [];

    for (const item of watchlist) {
      const price = currentPrices[item.symbol];
      if (!price) continue;

      let message = "";
      if (item.upperLimit && price >= item.upperLimit) {
        message = `${item.symbol} has hit your upper limit of $${item.upperLimit}! Current: $${price}`;
      } else if (item.lowerLimit && price <= item.lowerLimit) {
        message = `${item.symbol} has dropped to your lower limit of $${item.lowerLimit}! Current: $${price}`;
      }

      if (message) {
        // IDEMPOTENCY: Create a hash based on User, Symbol, and current Day
        // This ensures only ONE alert per stock per day is pushed
        const dateKey = new Date().toISOString().split('T')[0];
        const alertHash = `${userId}_${item.symbol}_${dateKey}`;

        try {
          const newAlert = await Notification.create({
            user: userId,
            message,
            alertHash
          });
          alertsCreated.push(newAlert);
        } catch (err) {
          // If error is code 11000 (Duplicate Key), it means alert was already sent today
          continue;
        }
      }
    }
    res.json({ success: true, alertsCreated });
  } catch (err) {
    res.status(500).json({ message: "Alert check failed" });
  }
};