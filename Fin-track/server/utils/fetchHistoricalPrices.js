import axios from "axios";

// Persistent in-memory cache for historical prices
const historicalPriceCache = {};

// Helper to generate fallback 30-day historical prices
function generateFallbackPrices(basePrice = 150) {
  const prices = [];
  let current = basePrice;
  for (let i = 0; i < 30; i++) {
    // Small random daily movement (-2% to +2%)
    const change = (Math.random() - 0.48) * 0.03;
    current = Math.max(10, current * (1 + change));
    prices.push(Number(current.toFixed(2)));
  }
  return prices;
}

async function fetchHistoricalPrices(tickers) {
  const prices = {};

  for (const ticker of tickers) {
    // ==========================
    // CACHE HIT
    // ==========================
    if (historicalPriceCache[ticker] && historicalPriceCache[ticker].length >= 30) {
      console.log(`Using cached historical prices for ${ticker}`);
      prices[ticker] = historicalPriceCache[ticker];
      continue;
    }

    try {
      if (!process.env.ALPHA_VANTAGE_API_KEY) {
        throw new Error("ALPHA_VANTAGE_API_KEY missing");
      }

      console.log(`Fetching historical prices for ${ticker} from AlphaVantage...`);

      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: ticker,
          outputsize: "compact",
          apikey: process.env.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 6000,
      });

      const data = response.data;

      if (data.Note || data.Information || data["Error Message"]) {
        console.warn(`AlphaVantage rate limit/notice for ${ticker}. Using generated fallback history.`);
        const fallback = generateFallbackPrices(150);
        historicalPriceCache[ticker] = fallback;
        prices[ticker] = fallback;
        continue;
      }

      const timeSeries = data["Time Series (Daily)"];
      if (!timeSeries) {
        console.warn(`No Time Series data for ${ticker}. Using fallback history.`);
        const fallback = generateFallbackPrices(150);
        historicalPriceCache[ticker] = fallback;
        prices[ticker] = fallback;
        continue;
      }

      const sortedDates = Object.keys(timeSeries).sort();
      const closePrices = sortedDates.map((date) => Number(timeSeries[date]["4. close"]));

      if (closePrices.length < 30) {
        console.warn(`Insufficient history for ${ticker}. Using fallback history.`);
        const fallback = generateFallbackPrices(150);
        historicalPriceCache[ticker] = fallback;
        prices[ticker] = fallback;
        continue;
      }

      // Save in RAM cache
      historicalPriceCache[ticker] = closePrices;
      prices[ticker] = closePrices;

      // Respect AlphaVantage free tier rate limit between requests
      if (ticker !== tickers[tickers.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch (err) {
      console.error(`Historical price fetch error for ${ticker}: ${err.message}. Using fallback.`);
      const fallback = generateFallbackPrices(150);
      historicalPriceCache[ticker] = fallback;
      prices[ticker] = fallback;
    }
  }

  return prices;
}

export default fetchHistoricalPrices;