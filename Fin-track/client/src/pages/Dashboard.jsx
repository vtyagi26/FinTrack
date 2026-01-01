import { useEffect, useState, useRef } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  ArrowLeftRight, 
  BarChart3, 
  MessageSquare, 
  LogOut 
} from "lucide-react"; // Using Lucide for cleaner icons

import Chatbot from "./Chatbot";
import Invested from "../pages/Invested";
import Returns from "../pages/Returns";
import ProfitLoss from "../pages/ProfitLoss";
import MarketAnalytics from "../pages/MarketAnalytics";
import BuySell from "../pages/BuySell";

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ handleLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Invested", path: "/dashboard/invested", icon: <Wallet size={20} /> },
    { label: "Returns", path: "/dashboard/returns", icon: <TrendingUp size={20} /> },
    { label: "Buy / Sell", path: "/dashboard/buy-sell", icon: <ArrowLeftRight size={20} /> },
    { label: "Market Analytics", path: "/dashboard/market-analytics", icon: <BarChart3 size={20} /> },
    { label: "AI Assistant", path: "/dashboard/chatbot", icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/dashboard" className="text-2xl font-black tracking-tighter text-blue-500">
          FIN<span className="text-white">TRACK</span>
        </Link>
      </div>

      <nav className="flex-grow px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                ? "bg-blue-600 text-white" 
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD HOME ---
const DashboardHome = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchLock = useRef(false);

  const symbols = ["AAPL", "MSFT", "TSLA"];
  const CACHE_KEY = "stock_cache_v1";
  const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    let isMounted = true;
    const controller = new AbortController();

const fetchStockData = async () => {
  try {
    setLoading(true);
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
    const results = [];

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      // Add a cache-buster (_=Date.now()) to force a fresh look at the API
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}&_=${Date.now()}`
      );
      
      const data = await res.json();
      console.log(`Data for ${symbol}:`, data); // CHECK YOUR CONSOLE HERE

      if (data["Note"] || data["Information"]) {
        setError("API Limit Reached (25/day). Try again tomorrow or use a different key.");
        break; 
      }

      const quote = data["Global Quote"];
      if (quote && quote["05. price"]) {
        results.push({
          symbol: quote["01. symbol"],
          price: parseFloat(quote["05. price"]).toFixed(2),
          high: parseFloat(quote["03. high"]).toFixed(2),
          low: parseFloat(quote["04. low"]).toFixed(2),
          changePercent: quote["10. change percent"],
        });
        setStocks([...results]); // Update UI immediately per stock
      }

      if (i < symbols.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 15000)); // 15s delay
      }
    }
  } catch (err) {
    setError("Failed to fetch. Check internet or API status.");
  } finally {
    setLoading(false);
  }
};

    fetchStockData();
    return () => { isMounted = false; controller.abort(); };
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">Market Overview</h2>
        <p className="text-gray-400">Real-time insights for your tracked symbols.</p>
      </header>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Live Watchlist</h3>
        {loading && (
          <div className="flex items-center text-blue-400 text-sm animate-pulse">
            <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
            Syncing Live Data...
          </div>
        )}
      </div>

      {error && !stocks.length && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-colors shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{stock.symbol}</span>
                <p className="text-3xl font-mono text-white mt-1">${stock.price}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${parseFloat(stock.change) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {stock.changePercent}
              </span>
            </div>
            <div className="grid grid-cols-2 pt-4 border-t border-gray-700 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Day High</p>
                <p className="text-white font-medium">${stock.high}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Day Low</p>
                <p className="text-white font-medium">${stock.low}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT WRAPPER ---
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    } else {
      setUser({ 
        name: localStorage.getItem("name"), 
        email: localStorage.getItem("email") 
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Fixed Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
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