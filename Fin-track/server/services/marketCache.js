import axios from "axios";

// Cache TTL — 5 minutes for real data
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = {
  data: null,
  timestamp: 0,
  isFallback: false,
};

// Diagnostic state — exposed via /api/market/debug
export let lastFetchDiag = {
  attemptedAt: null,
  source: null, // "finnhub" or "alphavantage"
  apiKeyPresent: false,
  apiKeyPrefix: null,
  symbolResults: [],
  error: null,
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

// ─── Finnhub (Primary — 60 req/min free, no daily cap) ───────────────────────
async function fetchFromFinnhub(symbols) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return null; // Signal: key not available, try next source

  console.log(`[MarketCache] Using Finnhub (key: ${token.slice(0, 6)}...)`);
  lastFetchDiag.source = "finnhub";
  lastFetchDiag.apiKeyPresent = true;
  lastFetchDiag.apiKeyPrefix = token.slice(0, 6) + "...";

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const symDiag = { symbol, status: "pending", price: null, detail: null };

    try {
      const response = await axios.get("https://finnhub.io/api/v1/quote", {
        params: { symbol, token },
        timeout: 8000,
      });

      const { c: current, h: high, l: low, dp: changePercent } = response.data;

      if (current && current > 0) {
        const sign = changePercent >= 0 ? "+" : "";
        results.push({
          symbol,
          price: current.toFixed(2),
          high: (high || current).toFixed(2),
          low: (low || current).toFixed(2),
          changePercent: `${sign}${changePercent?.toFixed(4) ?? "0.0000"}%`,
        });
        symDiag.status = "ok";
        symDiag.price = current.toFixed(2);
        console.log(`[MarketCache] ✓ ${symbol}: $${current.toFixed(2)} (${sign}${changePercent?.toFixed(2)}%)`);
      } else {
        symDiag.status = "empty_response";
        symDiag.detail = `c=${current}`;
        console.warn(`[MarketCache] Finnhub returned zero/null price for ${symbol}`);
      }
    } catch (err) {
      symDiag.status = "exception";
      symDiag.detail = err.message;
      console.error(`[MarketCache] Finnhub error for ${symbol}: ${err.message}`);
    }

    lastFetchDiag.symbolResults.push(symDiag);

    // Finnhub free tier: 60/min → ~1 per second is safe
    if (i < symbols.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return results.length > 0 ? results : null;
}

// ─── Alpha Vantage (Fallback — 25 req/day free) ───────────────────────────────
async function fetchFromAlphaVantage(symbols) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;

  console.log(`[MarketCache] Trying Alpha Vantage (key: ${apiKey.slice(0, 6)}...) as fallback`);
  lastFetchDiag.source = "alphavantage";
  lastFetchDiag.apiKeyPresent = true;
  lastFetchDiag.apiKeyPrefix = apiKey.slice(0, 6) + "...";

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const symDiag = { symbol, status: "pending", price: null, detail: null };

    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: { function: "GLOBAL_QUOTE", symbol, apikey: apiKey },
        timeout: 12000,
      });

      const raw = response.data;

      if (raw.Note || raw.Information) {
        const msg = (raw.Note || raw.Information).slice(0, 200);
        console.warn(`[MarketCache] Alpha Vantage RATE LIMIT for ${symbol}: ${msg}`);
        symDiag.status = "rate_limited";
        symDiag.detail = msg;
        lastFetchDiag.symbolResults.push(symDiag);
        continue;
      }

      if (raw["Error Message"]) {
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
        console.log(`[MarketCache] ✓ ${symbol}: $${price} (via Alpha Vantage)`);
      } else {
        symDiag.status = "empty_response";
        symDiag.detail = JSON.stringify(raw).slice(0, 200);
      }
    } catch (err) {
      symDiag.status = "exception";
      symDiag.detail = err.message;
      console.error(`[MarketCache] Alpha Vantage error for ${symbol}: ${err.message}`);
    }

    lastFetchDiag.symbolResults.push(symDiag);

    if (i < symbols.length - 1) {
      await new Promise((r) => setTimeout(r, 1500)); // AV rate limit: 5/min
    }
  }

  return results.length > 0 ? results : null;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function getBatchQuotesFromCache(symbols = DEFAULT_SYMBOLS) {
  const now = Date.now();

  if (cache.data && !cache.isFallback && now - cache.timestamp < CACHE_TTL_MS) {
    console.log(`[MarketCache] Serving ${cache.data.length} quotes from cache (age: ${Math.round((now - cache.timestamp) / 1000)}s)`);
    return cache.data;
  }

  lastFetchDiag.attemptedAt = new Date().toISOString();
  lastFetchDiag.symbolResults = [];
  lastFetchDiag.error = null;

  console.log(`[MarketCache] Cache miss — fetching fresh quotes for: ${symbols.join(", ")}`);

  // Try Finnhub first (generous rate limits), fall back to Alpha Vantage
  let results = await fetchFromFinnhub(symbols);

  if (!results) {
    results = await fetchFromAlphaVantage(symbols);
  }

  if (results && results.length > 0) {
    cache = { data: results, timestamp: Date.now(), isFallback: false };
    console.log(`[MarketCache] ✓ Cached ${results.length} real quotes via ${lastFetchDiag.source}.`);
    return cache.data;
  }

  // Serve stale real cache rather than fallback
  if (cache.data && !cache.isFallback) {
    console.warn("[MarketCache] All sources failed. Serving stale real cache.");
    return cache.data;
  }

  console.error("[MarketCache] ❌ All sources failed — returning approximate fallback data. Add FINNHUB_API_KEY to Render env vars.");
  lastFetchDiag.error = "All API sources failed. No FINNHUB_API_KEY or ALPHA_VANTAGE_API_KEY working.";
  return getFallbackData();
}

// Updated to current market prices (Aug 2026) — only shown if ALL APIs fail
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
