import axios from "axios";

async function fetchHistoricalPrices(tickers) {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    throw new Error("ALPHA_VANTAGE_API_KEY is missing in server/.env");
  }

  const prices = {};

  for (const ticker of tickers) {
    const response = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol: ticker,
        outputsize: "compact",
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    const data = response.data;

    if (data.Note || data.Information) {
      throw new Error(
        `AlphaVantage limit/message for ${ticker}: ${data.Note || data.Information}`
      );
    }

    if (data["Error Message"]) {
      throw new Error(`Invalid ticker or AlphaVantage error for ${ticker}`);
    }

    const timeSeries = data["Time Series (Daily)"];

    if (!timeSeries) {
      console.log("AlphaVantage raw response:", data);
      throw new Error(`Could not fetch historical prices for ${ticker}`);
    }

    const sortedDates = Object.keys(timeSeries).sort();

    prices[ticker] = sortedDates.map((date) => {
      return Number(timeSeries[date]["4. close"]);
    });

    if (prices[ticker].length < 30) {
      throw new Error(`Not enough historical price data for ${ticker}`);
    }
  }

  return prices;
}

export default fetchHistoricalPrices;