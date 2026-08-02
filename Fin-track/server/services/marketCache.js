import axios from "axios";

// 3 minutes cache TTL (180,000 ms)
const CACHE_TTL_MS = 3 * 60 * 1000;

let cache = {
  data: null,
  timestamp: 0,
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

export async function getBatchQuotesFromCache(symbols = DEFAULT_SYMBOLS) {
  const now = Date.now();

  // Return cached data if fresh (less than 3 minutes old)
  if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    console.log("Serving stock quotes from server 3-min cache...");
    return cache.data;
  }

  console.log("Cache expired or empty. Fetching fresh quotes from AlphaVantage...");

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      if (apiKey) {
        const response = await axios.get("https://www.alphavantage.co/query", {
          params: {
            function: "GLOBAL_QUOTE",
            symbol,
            apikey: apiKey,
          },
          timeout: 5000,
        });

        const quote = response.data?.["Global Quote"];
        if (quote && quote["05. price"]) {
          results.push({
            symbol: quote["01. symbol"] || symbol,
            price: parseFloat(quote["05. price"]).toFixed(2),
            high: parseFloat(quote["03. high"]).toFixed(2),
            low: parseFloat(quote["04. low"]).toFixed(2),
            changePercent: quote["10. change percent"] || "0.00%",
          });
        }
      }
    } catch (err) {
      console.error(`Error fetching AlphaVantage quote for ${symbol}:`, err.message);
    }

    // Small delay between AlphaVantage requests to avoid rate limits
    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  // If AlphaVantage returned results, update cache
  if (results.length > 0) {
    cache = {
      data: results,
      timestamp: Date.now(),
    };
    return cache.data;
  }

  // Fallback to previous cached data if available (e.g., rate limit hit)
  if (cache.data) {
    console.log("Rate limit hit or API error; serving previous cached data");
    return cache.data;
  }

  // Initial fallback mock data if API key is missing or fails on cold start
  return [
    { symbol: "AAPL", price: "185.50", high: "187.20", low: "184.10", changePercent: "+0.85%" },
    { symbol: "MSFT", price: "415.20", high: "418.00", low: "412.50", changePercent: "+1.12%" },
    { symbol: "TSLA", price: "248.80", high: "252.40", low: "245.00", changePercent: "-0.45%" },
  ];
}
