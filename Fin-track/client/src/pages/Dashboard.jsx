import { useEffect, useState, useRef } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Wallet, TrendingUp, ArrowLeftRight, 
  BarChart3, MessageSquare, LogOut, Clock, Mail, Bell 
} from "lucide-react";

import Chatbot from "./Chatbot";
import Invested from "../pages/Invested";
import Returns from "../pages/Returns";
import ProfitLoss from "../pages/ProfitLoss";
import MarketAnalytics from "../pages/MarketAnalytics";
import BuySell from "../pages/BuySell";
import TransactionHistory from "../pages/TransactionHistory";
import MailNotifications from "../pages/MailNotifications"; // New Page
import Watchlist from "../pages/Watchlist"; // New Page

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ handleLogout, unreadCount }) => {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Watchlist", path: "/dashboard/watchlist", icon: <Bell size={20} /> },
    { label: "Invested", path: "/dashboard/invested", icon: <Wallet size={20} /> },
    { label: "Returns", path: "/dashboard/returns", icon: <TrendingUp size={20} /> },
    { label: "Buy / Sell", path: "/dashboard/buy-sell", icon: <ArrowLeftRight size={20} /> },
    { label: "History", path: "/dashboard/history", icon: <Clock size={20} /> },
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
        <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
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

  useEffect(() => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    const fetchStockData = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
        const token = localStorage.getItem("token");
        const currentResults = [];

        for (let i = 0; i < symbols.length; i++) {
          const symbol = symbols[i];
          const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
          const data = await res.json();
          const quote = data["Global Quote"];

          if (quote && quote["05. price"]) {
            const price = parseFloat(quote["05. price"]).toFixed(2);
            const stockObj = {
              symbol: quote["01. symbol"],
              price: price,
              high: parseFloat(quote["03. high"]).toFixed(2),
              low: parseFloat(quote["04. low"]).toFixed(2),
              changePercent: quote["10. change percent"],
            };

            currentResults.push(stockObj);
            setStocks([...currentResults]); 

            // Update Cache immediately for Buy/Sell page
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: currentResults, timestamp: Date.now() }));

            // --- ALERT ENGINE TRIGGER ---
            // Send the fresh price to backend to check against user limits
            fetch("http://localhost:5000/api/alerts/check", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ symbol: stockObj.symbol, price: stockObj.price })
            }).catch(err => console.error("Alert check failed"));
          }

          if (i < symbols.length - 1) await new Promise(r => setTimeout(r, 15000));
        }
      } catch (err) {
        setError("Market sync failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Market Overview</h2>
          <p className="text-gray-400">Real-time data synced with your Watchlist limits.</p>
        </div>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-colors shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{stock.symbol}</span>
                <p className="text-3xl font-mono text-white mt-1">${stock.price}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${parseFloat(stock.changePercent) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {stock.changePercent}
              </span>
            </div>
            <div className="grid grid-cols-2 pt-4 border-t border-gray-700 gap-4 text-xs">
              <div><p className="text-gray-500 uppercase">High</p><p className="text-white">${stock.high}</p></div>
              <div><p className="text-gray-500 uppercase">Low</p><p className="text-white">${stock.low}</p></div>
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
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    } else {
      setUser({ name: localStorage.getItem("name") });
      fetchNotifications();
    }
  }, [navigate]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center animate-pulse text-blue-500 font-bold">LOADING...</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 h-screen overflow-y-auto">
        {/* Top Header Bar with Mail Icon */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center px-8">
           <div className="text-sm font-medium text-gray-400">Welcome back, {user.name}</div>
           <Link to="/dashboard/notifications" className="relative p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all group">
              <Mail size={20} className="text-gray-400 group-hover:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-gray-900 font-bold">
                  {unreadCount}
                </span>
              )}
           </Link>
        </div>

        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="invested" element={<Invested />} />
          <Route path="returns" element={<Returns />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="buy-sell" element={<BuySell />} />
          <Route path="notifications" element={<MailNotifications />} />
          <Route path="chatbot" element={<Chatbot />} />
        </Routes>
      </main>
    </div>
  );
}