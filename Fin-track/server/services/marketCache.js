import axios from "axios";

// 3 minutes cache TTL (180,000 ms) — only for real API data
const CACHE_TTL_MS = 3 * 60 * 1000;

let cache = {
  data: null,
  timestamp: 0,
  isFallback: false, // true = data came from mock, do NOT serve beyond TTL
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

export async function getBatchQuotesFromCache(symbols = DEFAULT_SYMBOLS) {
  const now = Date.now();

  // Only serve real cached data within TTL — never serve stale fallback data
  if (cache.data && !cache.isFallback && now - cache.timestamp < CACHE_TTL_MS) {
    console.log("Serving stock quotes from server 3-min cache...");
    return cache.data;
  }

  console.log("Cache expired or empty. Fetching fresh quotes from AlphaVantage...");

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.warn("ALPHA_VANTAGE_API_KEY is not set. Returning fallback mock data.");
    return getFallbackData();
  }

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol,
          apikey: apiKey,
        },
        timeout: 8000,
      });

      const raw = response.data;

      // Detect rate-limit / info messages from AlphaVantage
      if (raw.Note || raw.Information) {
        console.warn(`AlphaVantage rate-limit notice for ${symbol}: ${raw.Note || raw.Information}`);
        // Don't break — try next symbol, may still succeed if partially under limit
        continue;
      }

      if (raw["Error Message"]) {
        console.warn(`AlphaVantage error for ${symbol}: ${raw["Error Message"]}`);
        continue;
      }

      const quote = raw["Global Quote"];
      if (quote && quote["05. price"]) {
        results.push({
          symbol: quote["01. symbol"] || symbol,
          price: parseFloat(quote["05. price"]).toFixed(2),
          high: parseFloat(quote["03. high"]).toFixed(2),
          low: parseFloat(quote["04. low"]).toFixed(2),
          changePercent: quote["10. change percent"] || "0.00%",
        });
      } else {
        console.warn(`Empty Global Quote for ${symbol}. Skipping.`);
      }
    } catch (err) {
      console.error(`Error fetching AlphaVantage quote for ${symbol}:`, err.message);
    }

    // Respect AlphaVantage free tier rate limit (5 calls/min)
    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  // Successfully fetched real data — cache it
  if (results.length > 0) {
    cache = {
      data: results,
      timestamp: Date.now(),
      isFallback: false,
    };
    console.log(`Cached ${results.length} fresh quotes from AlphaVantage.`);
    return cache.data;
  }

  // API returned nothing real — serve previous real cached data if available
  if (cache.data && !cache.isFallback) {
    console.log("API fetch returned no data; serving last known real cache.");
    return cache.data;
  }

  // Last resort: return mock data but do NOT cache it (so next request retries the API)
  console.warn("Returning fallback mock data. Will retry API on next request.");
  return getFallbackData();
}

function getFallbackData() {
  return [
    { symbol: "AAPL", price: "185.50", high: "187.20", low: "184.10", changePercent: "+0.85%" },
    { symbol: "MSFT", price: "415.20", high: "418.00", low: "412.50", changePercent: "+1.12%" },
    { symbol: "TSLA", price: "248.80", high: "252.40", low: "245.00", changePercent: "-0.45%" },
  ];
}

// Exported so routes can force a cache bust (e.g. after key rotation)
export function clearMarketCache() {
  cache = { data: null, timestamp: 0, isFallback: false };
  console.log("Market cache manually cleared.");
}
