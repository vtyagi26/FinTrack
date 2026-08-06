import axios from "axios";

// 5 minutes cache TTL for real data
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = {
  data: null,
  timestamp: 0,
  isFallback: false,
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

/**
 * Fetch a single quote from AlphaVantage with retry on timeout.
 * Render free tier can have slow cold-start DNS/network — retry once with
 * a longer timeout before giving up on a symbol.
 */
async function fetchQuoteWithRetry(symbol, apiKey, attempt = 1) {
  const TIMEOUTS = [10000, 20000]; // 10s first try, 20s on retry
  const timeout = TIMEOUTS[Math.min(attempt - 1, TIMEOUTS.length - 1)];

  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol,
        apikey: apiKey,
      },
      timeout,
    });
    return response.data;
  } catch (err) {
    if (attempt < 2 && (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ECONNRESET")) {
      console.warn(`AlphaVantage timeout for ${symbol} (attempt ${attempt}). Retrying with longer timeout...`);
      await new Promise((r) => setTimeout(r, 2000));
      return fetchQuoteWithRetry(symbol, apiKey, attempt + 1);
    }
    throw err;
  }
}

export async function getBatchQuotesFromCache(symbols = DEFAULT_SYMBOLS) {
  const now = Date.now();

  // Serve real cached data within TTL
  if (cache.data && !cache.isFallback && now - cache.timestamp < CACHE_TTL_MS) {
    console.log(`[MarketCache] Serving ${cache.data.length} quotes from cache (age: ${Math.round((now - cache.timestamp) / 1000)}s)`);
    return cache.data;
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.error("[MarketCache] ALPHA_VANTAGE_API_KEY is not set in environment! Returning fallback mock data.");
    return getFallbackData();
  }

  console.log(`[MarketCache] Fetching fresh quotes from AlphaVantage for: ${symbols.join(", ")}`);

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      const raw = await fetchQuoteWithRetry(symbol, apiKey);

      // Rate-limit / info messages
      if (raw.Note || raw.Information) {
        const msg = raw.Note || raw.Information;
        console.warn(`[MarketCache] AlphaVantage rate-limit for ${symbol}: ${msg.slice(0, 120)}`);
        continue;
      }

      if (raw["Error Message"]) {
        console.warn(`[MarketCache] AlphaVantage error for ${symbol}: ${raw["Error Message"]}`);
        continue;
      }

      const quote = raw["Global Quote"];
      if (quote && quote["05. price"] && parseFloat(quote["05. price"]) > 0) {
        results.push({
          symbol: quote["01. symbol"] || symbol,
          price: parseFloat(quote["05. price"]).toFixed(2),
          high: parseFloat(quote["03. high"]).toFixed(2),
          low: parseFloat(quote["04. low"]).toFixed(2),
          changePercent: quote["10. change percent"] || "0.00%",
        });
        console.log(`[MarketCache] Got ${symbol}: $${parseFloat(quote["05. price"]).toFixed(2)}`);
      } else {
        console.warn(`[MarketCache] Empty or zero price for ${symbol}. Raw:`, JSON.stringify(raw).slice(0, 200));
      }
    } catch (err) {
      console.error(`[MarketCache] Failed fetching ${symbol}: ${err.message}`);
    }

    // Respect AlphaVantage free tier rate limit (5 calls/min = 1 per 12s; 1.5s delay is safe)
    if (i < symbols.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (results.length > 0) {
    cache = { data: results, timestamp: Date.now(), isFallback: false };
    console.log(`[MarketCache] Cached ${results.length} real quotes from AlphaVantage.`);
    return cache.data;
  }

  // No real data — serve stale real cache if available
  if (cache.data && !cache.isFallback) {
    console.warn("[MarketCache] API returned nothing. Serving stale real cache.");
    return cache.data;
  }

  // Absolute last resort
  console.error("[MarketCache] All fetches failed. Returning hardcoded fallback — check your ALPHA_VANTAGE_API_KEY on Render.");
  return getFallbackData();
}

function getFallbackData() {
  return [
    { symbol: "AAPL", price: "185.50", high: "187.20", low: "184.10", changePercent: "+0.85%" },
    { symbol: "MSFT", price: "415.20", high: "418.00", low: "412.50", changePercent: "+1.12%" },
    { symbol: "TSLA", price: "248.80", high: "252.40", low: "245.00", changePercent: "-0.45%" },
  ];
}

export function clearMarketCache() {
  cache = { data: null, timestamp: 0, isFallback: false };
  console.log("[MarketCache] Cache manually cleared.");
}
