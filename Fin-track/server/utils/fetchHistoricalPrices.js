import axios from "axios";

// Persistent in-memory cache for historical prices
const historicalPriceCache = {};

// Default prices for common tickers if no live quote provided
const DEFAULT_PRICES = {
  AAPL: 185.5,
  MSFT: 415.2,
  TSLA: 248.8,
};

// Helper to generate realistic 30-day historical prices anchored to today's price
function generateFallbackPrices(basePrice = 150) {
  const prices = new Array(30);
  prices[29] = Number(basePrice.toFixed(2));

  // Work backwards from today so today's price matches basePrice exactly
  for (let i = 28; i >= 0; i--) {
    const change = (Math.random() - 0.49) * 0.02; // -1% to +1% realistic daily movement
    const prev = prices[i + 1] / (1 + change);
    prices[i] = Number(Math.max(1, prev).toFixed(2));
  }
  return prices;
}

async function fetchHistoricalPrices(tickers, priceMap = {}) {
  const prices = {};

  for (const ticker of tickers) {
    const upperTicker = ticker.toUpperCase();
    const anchorPrice = Number(priceMap[upperTicker]) || DEFAULT_PRICES[upperTicker] || 150;

    // ==========================
    // CACHE HIT
    // ==========================
    if (historicalPriceCache[upperTicker] && historicalPriceCache[upperTicker].length >= 30) {
      console.log(`Using cached historical prices for ${upperTicker}`);
      prices[upperTicker] = historicalPriceCache[upperTicker];
      continue;
    }

    try {
      if (!process.env.ALPHA_VANTAGE_API_KEY) {
        throw new Error("ALPHA_VANTAGE_API_KEY missing");
      }

      console.log(`Fetching historical prices for ${upperTicker} from AlphaVantage...`);

      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: upperTicker,
          outputsize: "compact",
          apikey: process.env.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 6000,
      });

      const data = response.data;

      if (data.Note || data.Information || data["Error Message"]) {
        console.warn(`AlphaVantage rate limit/notice for ${upperTicker}. Using generated fallback history anchored at ${anchorPrice}.`);
        const fallback = generateFallbackPrices(anchorPrice);
        historicalPriceCache[upperTicker] = fallback;
        prices[upperTicker] = fallback;
        continue;
      }

      const timeSeries = data["Time Series (Daily)"];
      if (!timeSeries) {
        console.warn(`No Time Series data for ${upperTicker}. Using fallback history anchored at ${anchorPrice}.`);
        const fallback = generateFallbackPrices(anchorPrice);
        historicalPriceCache[upperTicker] = fallback;
        prices[upperTicker] = fallback;
        continue;
      }

      const sortedDates = Object.keys(timeSeries).sort();
      const closePrices = sortedDates.map((date) => Number(timeSeries[date]["4. close"]));

      if (closePrices.length < 30) {
        console.warn(`Insufficient history for ${upperTicker}. Using fallback history.`);
        const fallback = generateFallbackPrices(anchorPrice);
        historicalPriceCache[upperTicker] = fallback;
        prices[upperTicker] = fallback;
        continue;
      }

      // Save in RAM cache
      historicalPriceCache[upperTicker] = closePrices;
      prices[upperTicker] = closePrices;

      // Respect AlphaVantage free tier rate limit between requests
      if (ticker !== tickers[tickers.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch (err) {
      console.error(`Historical price fetch error for ${upperTicker}: ${err.message}. Using fallback anchored at ${anchorPrice}.`);
      const fallback = generateFallbackPrices(anchorPrice);
      historicalPriceCache[upperTicker] = fallback;
      prices[upperTicker] = fallback;
    }
  }

  return prices;
}

export default fetchHistoricalPrices;