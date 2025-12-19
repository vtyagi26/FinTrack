import { useEffect, useState, useRef } from "react";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import Chatbot from "./Chatbot"; 
import Invested from "../pages/Invested";
import Returns from "../pages/Returns";
import ProfitLoss from "../pages/ProfitLoss";
import MarketAnalytics from "../pages/MarketAnalytics";
import BuySell from "../pages/BuySell";

const DashboardHome = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // This ref prevents the double-call in React Strict Mode
  const fetchLock = useRef(false);

  const symbols = ["AAPL", "MSFT", "TSLA"];
  const CACHE_KEY = "stock_cache_v1";
  const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // 1. Prevent double execution
    if (fetchLock.current) return;
    fetchLock.current = true;

    let isMounted = true;
    const controller = new AbortController();

    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError("");

        // 2. Check Cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setStocks(data);
            setLoading(false);
            return;
          }
        }

        const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
        const results = [];

        for (let i = 0; i < symbols.length; i++) {
          if (!isMounted) break;

          const symbol = symbols[i];
          const res = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
            { signal: controller.signal }
          );
          const data = await res.json();

          // Check for the "Note" which is Alpha Vantage's way of saying "Slow down"
          if (data["Note"] || data["Information"]) {
            throw new Error("API Limit Reached. Using last known data or please wait 1 minute.");
          }

          const quote = data["Global Quote"];
          if (quote && quote["05. price"]) {
            results.push({
              symbol: quote["01. symbol"],
              price: parseFloat(quote["05. price"]).toFixed(2),
              high: parseFloat(quote["03. high"]).toFixed(2),
              low: parseFloat(quote["04. low"]).toFixed(2),
              change: quote["09. change"],
              changePercent: quote["10. change percent"],
            });
          }

          // 3. The Wait Logic (15 seconds)
          if (i < symbols.length - 1 && isMounted) {
            await new Promise((resolve) => setTimeout(resolve, 15000));
          }
        }

        if (isMounted && results.length > 0) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: results
          }));
          setStocks(results);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          // If we hit a limit but have old cache, show it instead of an error
          const backup = localStorage.getItem(CACHE_KEY);
          if (backup) setStocks(JSON.parse(backup).data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStockData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Analytics Overview</h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[
          { label: "Invested", path: "invested" },
          { label: "Returns", path: "returns" },
          { label: "Buy / Sell", path: "buy-sell" },
          { label: "Market Analytics", path: "market-analytics" }
        ].map((item) => (
          <Link
            key={item.label}
            to={`/dashboard/${item.path}`}
            className="bg-gray-800 rounded-lg shadow text-white flex items-center justify-center h-40 hover:bg-gray-700 transition-all border border-gray-700"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4">Live Market Watch</h3>
      
      {loading && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Fetching stocks... (Wait 15s)</p>
        </div>
      )}
      
      {error && !stocks.length && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold bg-gray-700 px-3 py-1 rounded text-blue-400">{stock.symbol}</span>
              <span className={`text-sm ${parseFloat(stock.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock.changePercent}
              </span>
            </div>
            <p className="text-4xl font-mono text-white mb-4">${stock.price}</p>
            <div className="grid grid-cols-2 text-xs text-gray-400 uppercase tracking-wider">
              <div>High: <span className="text-white block text-sm">${stock.high}</span></div>
              <div>Low: <span className="text-white block text-sm">${stock.low}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Authenticating...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-black tracking-tighter text-blue-500">
          FIN<span className="text-white">TRACK</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/dashboard/chatbot" className="text-gray-300 hover:text-white font-medium transition-colors">
            AI Assistant
          </Link>
          <button onClick={handleLogout} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-4 py-1.5 rounded-lg transition-all text-sm font-semibold">
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="invested" element={<Invested />} />
          <Route path="returns" element={<Returns />} />
          <Route path="profit-loss" element={<ProfitLoss />} />
          <Route path="market-analytics" element={<MarketAnalytics />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="buy-sell" element={<BuySell />} />
        </Routes>
      </main>
    </div>
  );
}