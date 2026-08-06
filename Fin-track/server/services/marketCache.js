import axios from "axios";

export let lastFetchDiag = {
  attemptedAt: null,
  source: "alphavantage",
  apiKeyPresent: false,
  apiKeyPrefix: null,
  symbolResults: [],
  error: null,
};

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "TSLA"];

export async function getBatchQuotesFromCache(symbols = DEFAULT_SYMBOLS) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  lastFetchDiag.attemptedAt = new Date().toISOString();
  lastFetchDiag.source = "alphavantage";
  lastFetchDiag.apiKeyPresent = !!apiKey;
  lastFetchDiag.apiKeyPrefix = apiKey ? apiKey.slice(0, 6) + "..." : null;
  lastFetchDiag.symbolResults = [];
  lastFetchDiag.error = null;

  if (!apiKey) {
    const msg = "ALPHA_VANTAGE_API_KEY is NOT set in environment variables.";
    console.error(`[MarketCache] ${msg}`);
    lastFetchDiag.error = msg;
    return getFallbackData();
  }

  console.log(`[MarketFetch] Fetching fresh quotes directly from Alpha Vantage for: ${symbols.join(", ")}`);

  const results = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const symDiag = { symbol, status: "pending", price: null, detail: null };

    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol,
          apikey: apiKey,
        },
        timeout: 10000,
      });

      const raw = response.data;

      if (raw.Note || raw.Information) {
        const msg = (raw.Note || raw.Information).slice(0, 200);
        console.warn(`[MarketFetch] Rate limit notice for ${symbol}: ${msg}`);
        symDiag.status = "rate_limited";
        symDiag.detail = msg;
        lastFetchDiag.symbolResults.push(symDiag);
        continue;
      }

      if (raw["Error Message"]) {
        console.warn(`[MarketFetch] API error for ${symbol}: ${raw["Error Message"]}`);
        symDiag.status = "api_error";
        symDiag.detail = raw["Error Message"];
        lastFetchDiag.symbolResults.push(symDiag);
        continue;
      }

      const quote = raw["Global Quote"];
      if (quote && quote["05. price"]) {
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
        console.log(`[MarketFetch] ✓ ${symbol}: $${price}`);
      } else {
        symDiag.status = "empty_response";
        symDiag.detail = JSON.stringify(raw).slice(0, 200);
      }
    } catch (err) {
      symDiag.status = "exception";
      symDiag.detail = err.message;
      console.error(`[MarketFetch] Error fetching ${symbol}:`, err.message);
    }

    lastFetchDiag.symbolResults.push(symDiag);

    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  if (results.length > 0) {
    return results;
  }

  console.warn("[MarketFetch] No quotes fetched from Alpha Vantage. Returning fallback mock data.");
  return getFallbackData();
}

function getFallbackData() {
  return [
    { symbol: "AAPL", price: "311.00", high: "311.71", low: "305.67", changePercent: "+0.52%" },
    { symbol: "MSFT", price: "487.46", high: "498.24", low: "485.68", changePercent: "-1.09%" },
    { symbol: "TSLA", price: "321.55", high: "327.14", low: "320.28", changePercent: "-1.77%" },
  ];
}

export function clearMarketCache() {
  console.log("[MarketCache] Caching disabled — direct API calls active.");
}

export function getCacheDiag() {
  return {
    cacheState: {
      cachingEnabled: false,
    },
    lastFetch: lastFetchDiag,
  };
}
