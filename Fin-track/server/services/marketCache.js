import axios from "axios";

// 5 minutes cache TTL for real data
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = {
  data: null,
  timestamp: 0,
  isFallback: false,
};

// Tracks the last diagnostic info for the /debug endpoint
export let lastFetchDiag = {
  attemptedAt: null,
  apiKeyPresent: false,
  apiKeyPrefix: null,
  symbolResults: [],
  error: null,
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

/**
 * Fetch a single quote from AlphaVantage with retry on timeout.
 * Render free tier can have slow cold-start DNS/network.
 */
async function fetchQuoteWithRetry(symbol, apiKey, attempt = 1) {
  const TIMEOUTS = [10000, 20000]; // 10s first try, 20s on retry
  const timeout = TIMEOUTS[Math.min(attempt - 1, TIMEOUTS.length - 1)];

  try {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: { function: "GLOBAL_QUOTE", symbol, apikey: apiKey },
      timeout,
    });
    return response.data;
  } catch (err) {
    if (attempt < 2 && (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ECONNRESET")) {
      console.warn(`[MarketCache] Timeout for ${symbol} (attempt ${attempt}). Retrying with ${TIMEOUTS[1]}ms...`);
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

  // Update diag
  lastFetchDiag.attemptedAt = new Date().toISOString();
  lastFetchDiag.apiKeyPresent = !!apiKey;
  lastFetchDiag.apiKeyPrefix = apiKey ? apiKey.slice(0, 6) + "..." : null;
  lastFetchDiag.symbolResults = [];
  lastFetchDiag.error = null;

  if (!apiKey) {
    const msg = "ALPHA_VANTAGE_API_KEY is NOT SET in environment variables!";
    console.error(`[MarketCache] ${msg}`);
    lastFetchDiag.error = msg;
    return getFallbackData();
  }

  console.log(`[MarketCache] Fetching fresh quotes from AlphaVantage (key: ${apiKey.slice(0, 6)}...) for: ${symbols.join(", ")}`);

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const symDiag = { symbol, status: "pending", price: null, detail: null };

    try {
      const raw = await fetchQuoteWithRetry(symbol, apiKey);

      if (raw.Note || raw.Information) {
        const msg = (raw.Note || raw.Information).slice(0, 200);
        console.warn(`[MarketCache] RATE LIMIT for ${symbol}: ${msg}`);
        symDiag.status = "rate_limited";
        symDiag.detail = msg;
        lastFetchDiag.symbolResults.push(symDiag);
        continue;
      }

      if (raw["Error Message"]) {
        console.warn(`[MarketCache] API error for ${symbol}: ${raw["Error Message"]}`);
        symDiag.status = "api_error";
        symDiag.detail = raw["Error Message"];
        lastFetchDiag.symbolResults.push(symDiag);
        continue;
      }

      const quote = raw["Global Quote"];
      if (quote && quote["05. price"] && parseFloat(quote["05. price"]) > 0) {
        const price = parseFloat(quote["05. price"]).toFixed(2);
        results.push({
          symbol: quote["01. symbol"] || symbol,
          price,
          high: parseFloat(quote["03. high"]).toFixed(2),
          low: parseFloat(quote["04. low"]).toFixed(2),
          changePercent: quote["10. change percent"] || "0.00%",
        });
        symDiag.status = "ok";
        symDiag.price = price;
        console.log(`[MarketCache] ✓ ${symbol}: $${price}`);
      } else {
        symDiag.status = "empty_response";
        symDiag.detail = JSON.stringify(raw).slice(0, 200);
        console.warn(`[MarketCache] Empty quote for ${symbol}. Raw: ${symDiag.detail}`);
      }
    } catch (err) {
      symDiag.status = "exception";
      symDiag.detail = err.message;
      console.error(`[MarketCache] Exception for ${symbol}: ${err.message}`);
    }

    lastFetchDiag.symbolResults.push(symDiag);

    if (i < symbols.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (results.length > 0) {
    cache = { data: results, timestamp: Date.now(), isFallback: false };
    console.log(`[MarketCache] ✓ Cached ${results.length} real quotes.`);
    return cache.data;
  }

  // No real data — serve stale real cache if available
  if (cache.data && !cache.isFallback) {
    console.warn("[MarketCache] API returned nothing. Serving stale real cache.");
    return cache.data;
  }

  console.error("[MarketCache] All fetches failed — returning fallback mock data.");
  return getFallbackData();
}

// ─── Fallback data with APPROXIMATE current prices ───────────────────────────
// These are updated periodically — check /api/market/debug if you see these.
function getFallbackData() {
  return [
    { symbol: "AAPL", price: "311.00", high: "311.71", low: "305.67", changePercent: "+0.52%" },
    { symbol: "MSFT", price: "487.46", high: "498.24", low: "485.68", changePercent: "-1.09%" },
    { symbol: "TSLA", price: "321.55", high: "327.14", low: "320.28", changePercent: "-1.77%" },
  ];
}

export function clearMarketCache() {
  cache = { data: null, timestamp: 0, isFallback: false };
  console.log("[MarketCache] Cache manually cleared.");
}

export function getCacheDiag() {
  return {
    cacheState: {
      hasData: !!cache.data,
      isFallback: cache.isFallback,
      ageSeconds: cache.timestamp ? Math.round((Date.now() - cache.timestamp) / 1000) : null,
      ttlSeconds: Math.round(CACHE_TTL_MS / 1000),
      symbols: cache.data?.map((d) => ({ symbol: d.symbol, price: d.price })) ?? [],
    },
    lastFetch: lastFetchDiag,
  };
}
