import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import Chatbot from "./Chatbot"; // adjust path if needed
import Invested from "../pages/Invested";
import Returns from "../pages/Returns";
import ProfitLoss from "../pages/ProfitLoss";
import MarketAnalytics from "../pages/MarketAnalytics";
import BuySell from "../pages/BuySell";





const DashboardHome = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add stock symbols you want to track
  const symbols = ["AAPL", "MSFT", "TSLA"];

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
        if (!apiKey) throw new Error("Missing Alpha Vantage API key in .env");

        const results = [];

        for (let i = 0; i < symbols.length; i++) {
          const symbol = symbols[i];

          // Throttle requests to avoid Alpha Vantage 5-req/min limit
          // eslint-disable-next-line no-await-in-loop
          const res = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
          );
          const data = await res.json();
          console.log(`Response for ${symbol}:`, data);

          const quote = data["Global Quote"];
          if (quote && quote["05. price"]) {
            results.push({
              symbol: quote["01. symbol"],
              price: quote["05. price"],
              high: quote["03. high"],
              low: quote["04. low"],
              change: quote["09. change"],
              changePercent: quote["10. change percent"],
            });
          }

          // Wait 12 seconds between requests (5 req/min limit)
          if (i < symbols.length - 1) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 12000));
          }
        }

        if (!results.length) throw new Error("No stock data received.");
        setStocks(results);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Analytics Overview</h2>
      {/* Buttons */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Link
          to="/dashboard/invested"
          className="bg-gray-800 rounded-lg shadow text-white flex items-center justify-center h-40 hover:bg-gray-700 text-lg font-semibold"
        >
          Invested
        </Link>
        <Link
          to="/dashboard/returns"
          className="bg-gray-800 rounded-lg shadow text-white flex items-center justify-center h-40 hover:bg-gray-700 text-lg font-semibold"
        >
          Returns
        </Link>
        <Link
          to="/dashboard/buy-sell"
          className="bg-gray-800 rounded-lg shadow text-white flex items-center justify-center h-40 hover:bg-gray-700 text-lg font-semibold"
        >
          Buy / Sell
        </Link>
        <Link
          to="/dashboard/market-analytics"
          className="bg-gray-800 rounded-lg shadow text-white flex items-center justify-center h-40 hover:bg-gray-700 text-lg font-semibold"
        >
          Market Analytics
        </Link>
      </div>

      {/* Stock Data */}
      <h3 className="text-2xl font-semibold text-white mb-4">Stocks at a Glance</h3>
      {loading && <p className="text-gray-400">Loading stock data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-gray-800 rounded-lg shadow p-6 text-white"
            >
              <h4 className="text-xl font-bold mb-2">{stock.symbol}</h4>
              <p>Price: {stock.price}</p>
              <p>High: {stock.high}</p>
              <p>Low: {stock.low}</p>
              <p>
                Change: {stock.change} ({stock.changePercent})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Placeholder components for pages


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (!token) {
      navigate("/signin");
    } else {
      setUser({ name, email });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return <p className="text-center text-white mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 shadow px-10 py-10 flex justify-between items-center">
        {/* Welcome Link */}
        <Link to="/dashboard" className="text-xl font-bold hover:underline">
          Welcome to your Dashboard
        </Link>

        <div className="flex space-x-4">
          {/* Chat with AI Button */}
          <Link
            to="/dashboard/chatbot"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
          >
            Chat with AI
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-grow">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="invested" element={<Invested />} />
          <Route path="returns" element={<Returns />} />
          <Route path="profit-loss" element={<ProfitLoss />} />
          <Route path="market-analytics" element={<MarketAnalytics />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="buy-sell" element={<BuySell />} />
        </Routes>
      </div>
    </div>
  );
}
