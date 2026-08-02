import axios from "axios";

// In-memory cache (cleared whenever the backend restarts)
const historicalPriceCache = {};

async function fetchHistoricalPrices(tickers) {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY is missing in server/.env");
  }

  const prices = {};

  for (const ticker of tickers) {
    // ==========================
    // CACHE HIT
    // ==========================
    if (historicalPriceCache[ticker]) {
      console.log(`Using cached historical prices for ${ticker}`);
      prices[ticker] = historicalPriceCache[ticker];
      continue;
    }

    console.log(`Fetching ${ticker} from AlphaVantage...`);

    const response = await axios.get(
      "https://www.alphavantage.co/query",
      {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: ticker,
          outputsize: "compact",
          apikey: process.env.ALPHA_VANTAGE_API_KEY,
        },
      }
    );

    const data = response.data;

    if (data.Note || data.Information) {
      throw new Error(
        `AlphaVantage limit/message for ${ticker}: ${
          data.Note || data.Information
        }`
      );
    }

    if (data["Error Message"]) {
      throw new Error(`Invalid ticker or AlphaVantage error for ${ticker}`);
    }

    const timeSeries = data["Time Series (Daily)"];

    if (!timeSeries) {
      console.log(data);
      throw new Error(`Could not fetch historical prices for ${ticker}`);
    }

    const sortedDates = Object.keys(timeSeries).sort();

    const closePrices = sortedDates.map(
      (date) => Number(timeSeries[date]["4. close"])
    );

    if (closePrices.length < 30) {
      throw new Error(`Not enough historical price data for ${ticker}`);
    }

    // Save in RAM
    historicalPriceCache[ticker] = closePrices;
    prices[ticker] = closePrices;

    // Respect AlphaVantage free tier rate limit
    if (ticker !== tickers[tickers.length - 1]) {
      console.log("Waiting 1.5 seconds before next request...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return prices;
}

export default fetchHistoricalPrices;