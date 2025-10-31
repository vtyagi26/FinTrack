import axios from "axios";

export const getQuote = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });

  if (!process.env.FINNHUB_API_KEY) {
    return res.status(500).json({ message: "Missing API key" }); // ✅ added
  }

  try {
    const response = await axios.get("https://finnhub.io/api/v1/quote", {
      params: { symbol, token: process.env.FINNHUB_API_KEY },
    });

    const { c: current, h: high, l: low, o: open, pc: prevClose } =
      response.data;

    res.json({ symbol, current, high, low, open, prevClose });
  } catch (err) {
    res.status(500).json({ message: "Error fetching market quote" });
  }
};
