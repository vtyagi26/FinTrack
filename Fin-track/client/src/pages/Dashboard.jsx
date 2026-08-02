import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../config/api";
import {
  useNavigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ArrowLeftRight,
  BarChart3,
  MessageSquare,
  LogOut,
  Clock,
  Mail,
  Bell,
} from "lucide-react";

import StockPrediction from "../pages/Stock_Prediction";
import Chatbot from "./Chatbot";
import Invested from "../pages/Invested";
import Returns from "../pages/Returns";
import BuySell from "../pages/BuySell";
import TransactionHistory from "../pages/TransactionHistory";
import MailNotifications from "../pages/MailNotifications";
import Watchlist from "../pages/Watchlist";
import QuantOptimizer from "../pages/QuantOptimizer";

// ---------------- SIDEBAR ----------------

const Sidebar = ({ handleLogout }) => {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Watchlist", path: "/dashboard/watchlist", icon: <Bell size={20} /> },
    { label: "Invested", path: "/dashboard/invested", icon: <Wallet size={20} /> },
    { label: "Returns", path: "/dashboard/returns", icon: <TrendingUp size={20} /> },
    { label: "Buy / Sell", path: "/dashboard/buy-sell", icon: <ArrowLeftRight size={20} /> },
    { label: "History", path: "/dashboard/history", icon: <Clock size={20} /> },
    { label: "AI Assistant", path: "/dashboard/chatbot", icon: <MessageSquare size={20} /> },
    { label: "Prediction Agent", path: "/dashboard/stock_prediction", icon: <MessageSquare size={20} /> },
    { label: "Quant Optimizer", path: "/dashboard/quant", icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link
          to="/dashboard"
          className="text-2xl font-black tracking-tighter text-blue-500"
        >
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

// ---------------- DASHBOARD HOME ----------------

const DashboardHome = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLock = useRef(false);

  const symbols = ["AAPL", "MSFT", "TSLA"];
  const CACHE_KEY = "stock_cache_v1";

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    const fetchStockData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/market/quotes`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setStocks(data);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            })
          );

          // Check price alerts for fetched stocks
          data.forEach((stockObj) => {
            fetch(`${API_BASE_URL}/api/alerts/check`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                symbol: stockObj.symbol,
                price: stockObj.price,
              }),
            }).catch(console.error);
          });
        }
      } catch (err) {
        console.error("Market quotes fetch error:", err);
        setError("Market sync failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);
    if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-400 text-lg animate-pulse">
          Loading market data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Market Overview
          </h2>
          <p className="text-gray-400">
            Real-time market snapshot
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-400 text-sm font-bold">
                  {stock.symbol}
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  ${stock.price}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  parseFloat(stock.changePercent) >= 0
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {stock.changePercent}
              </span>
            </div>

            <div className="grid grid-cols-2 mt-6 pt-4 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  High
                </p>

                <p className="font-semibold">
                  ${stock.high}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Low
                </p>

                <p className="font-semibold">
                  ${stock.low}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- MAIN DASHBOARD ----------------

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [holdings, setHoldings] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    setUser({
      name: localStorage.getItem("name"),
    });

    fetchNotifications();
    fetchHoldings();
  };

  const fetchHoldings = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/portfolio/holdings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const data = await res.json();

      setHoldings(
        data.map((holding) => ({
          ticker: holding.symbol,
          quantity: holding.quantity,
          currentPrice:
            holding.currentPrice ??
            holding.avgCost,
        }))
      );
    } catch (err) {
      console.error(err);
    }
    console.log(holdings);
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setUnreadCount(0);
        return;
      }

      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500 font-bold animate-pulse">
        Loading Dashboard...
      </div>
    );
  }
console.log("Dashboard Holdings");
console.table(holdings);
    return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar
        handleLogout={handleLogout}
        unreadCount={unreadCount}
      />

      <main className="flex-1 h-screen overflow-y-auto">
        {/* Top Header */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 px-8 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Welcome back,{" "}
            <span className="font-semibold text-white">
              {user.name}
            </span>
          </div>

          <Link
            to="/dashboard/notifications"
            className="relative p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
          >
            <Mail size={20} className="text-gray-300" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold border-2 border-gray-900">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        <Routes>
          <Route
            index
            element={<DashboardHome />}
          />

          <Route
            path="watchlist"
            element={<Watchlist />}
          />

          <Route
            path="invested"
            element={<Invested />}
          />

          <Route
            path="returns"
            element={<Returns />}
          />

          <Route
            path="buy-sell"
            element={<BuySell />}
          />

          <Route
            path="history"
            element={<TransactionHistory />}
          />

          <Route
            path="notifications"
            element={<MailNotifications />}
          />

          <Route
            path="chatbot"
            element={<Chatbot />}
          />

          <Route
            path="stock_prediction"
            element={<StockPrediction />}
          />

          <Route
            path="quant"
            element={
              
              <QuantOptimizer
                holdings={holdings}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}