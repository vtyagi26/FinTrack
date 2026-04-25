import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Search,
} from "lucide-react";

export default function StockPrediction() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fetchPrediction = async (e) => {
    e.preventDefault();

    const ticker = symbol.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `https://stock-analyser-ggjy.onrender.com/predict/${ticker}`
      );

      if (!res.ok) {
        throw new Error("Unable to fetch stock prediction.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-green-400">Stock Prediction</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero Search Section */}
        <div className="text-center py-10">
          <h2 className="text-4xl font-bold text-white">
            Predict Tomorrow’s Stock Price
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            Enter a stock ticker to get AI-powered next-day price prediction
          </p>

          <form
            onSubmit={fetchPrediction}
            className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Enter stock ticker (e.g. AAPL, TSLA, NVDA)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="flex-1 h-14 px-5 rounded-2xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 text-lg outline-none focus:border-green-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-semibold text-lg transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : (
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Predict
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-20 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <p className="text-lg">Search for a stock to begin prediction</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-400 animate-pulse text-lg">
            Fin-Track AI is analyzing market signals...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5">
              <p className="text-sm text-gray-400">Symbol</p>
              <h3 className="text-2xl font-bold mt-2">{result.symbol}</h3>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5">
              <p className="text-sm text-gray-400">Predicted Close</p>
              <h3 className="text-2xl font-bold mt-2">${result.predicted_close}</h3>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5">
              <p className="text-sm text-gray-400">Predicted Return</p>
              <h3 className="text-2xl font-bold mt-2">
                {(result.predicted_return * 100).toFixed(2)}%
              </h3>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5">
              <p className="text-sm text-gray-400">Direction</p>
              <div className="flex items-center gap-2 mt-2">
                {result.predicted_direction === "UP" ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <h3 className={`text-2xl font-bold ${result.predicted_direction === "UP" ? "text-green-400" : "text-red-400"}`}>
                  {result.predicted_direction}
                </h3>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <p className="text-sm text-gray-400">Confidence Score</p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-300">
                {(result.confidence * 100).toFixed(1)}% confidence
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5 md:col-span-2">
              <p className="text-sm text-gray-400">Prediction Timestamp</p>
              <p className="mt-2 text-lg text-gray-200">
                {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}