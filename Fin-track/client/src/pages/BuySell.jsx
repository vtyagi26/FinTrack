import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function BuySell() {
  const [stocks, setStocks] = useState([]);
  const [userHoldings, setUserHoldings] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // 7-Day Performance State
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);

  const token = localStorage.getItem("token");
  // MASTER LIST: These will always show up in the UI now
  const symbols = ["AAPL", "MSFT", "TSLA"];
  const CACHE_KEY = "stock_cache_v1";

  const fetchPerformance = async () => {
    try {
      const perfRes = await fetch(`${API_BASE_URL}/api/portfolio/performance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setHasPortfolio(!!perfData.hasPortfolio);
        setPerformanceData(perfData.performance || []);
      } else {
        setHasPortfolio(false);
        setPerformanceData([]);
      }
    } catch (err) {
      console.error("Error fetching 7d performance:", err);
      setHasPortfolio(false);
      setPerformanceData([]);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // 1. Fetch User Profile & Holdings from MongoDB
        const [userRes, holdingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/portfolio/holdings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          const validBalance = (typeof userData.balance === "number" && !isNaN(userData.balance) && userData.balance !== null) ? userData.balance : 5000;
          setBalance(validBalance);
        }
        if (holdingsRes.ok) {
          const holdingsData = await holdingsRes.json();
          setUserHoldings(holdingsData);
        }

        // 2. Load Prices from Cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setStocks(data);
        }

        // 3. Load 7-Day Performance
        await fetchPerformance();

      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [token]);

  const getOwnedQuantity = (symbol) => {
    const holding = userHoldings.find((h) => h.symbol === symbol);
    return holding ? holding.quantity : 0;
  };

  const handleQuantityChange = (symbol, value) => {
    setSelectedQuantities({ ...selectedQuantities, [symbol]: Math.max(0, Number(value)) });
  };

  const handleTrade = async (symbol, type) => {
    const quantity = selectedQuantities[symbol] || 0;
    const liveStock = stocks.find((s) => s.symbol === symbol);

    if (!liveStock) {
      setMessage({ text: "Cannot trade: Price not synced yet.", type: "error" });
      return;
    }

    const currentPrice = parseFloat(liveStock.price);
    const totalCost = currentPrice * quantity;

    if (quantity <= 0) return setMessage({ text: "Please enter a quantity", type: "error" });

    if (type === "buy" && totalCost > balance) {
      return setMessage({ text: "Insufficient buying power", type: "error" });
    }

    if (type === "sell" && quantity > getOwnedQuantity(symbol)) {
      return setMessage({ text: "Insufficient shares owned", type: "error" });
    }

    try {
      setMessage({ text: "Executing Trade on MongoDB...", type: "info" });
      const res = await fetch(`${API_BASE_URL}/api/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol, quantity: Number(quantity), price: currentPrice, type }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Success Updates
      setBalance(data.userBalance);
      setMessage({ text: `Successfully ${type} ${quantity} shares of ${symbol}`, type: "success" });

      // Refresh Holdings
      const hRes = await fetch(`${API_BASE_URL}/api/portfolio/holdings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserHoldings(await hRes.json());
      setSelectedQuantities({ ...selectedQuantities, [symbol]: "" });

      // Refresh 7-Day Performance Chart
      await fetchPerformance();

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  // Performance calculations for summary header
  const startVal = performanceData.length > 0 ? performanceData[0].totalValue : 5000;
  const currentVal = performanceData.length > 0 ? performanceData[performanceData.length - 1].totalValue : balance;
  const change7d = currentVal - startVal;
  const change7dPct = startVal > 0 ? (change7d / startVal) * 100 : 0;
  const isPositive7d = change7d >= 0;

  const handleResetBalance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/reset-balance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setMessage({ text: "Budget successfully reset to $5,000.00", type: "success" });
        await fetchPerformance();
      } else {
        setMessage({ text: data.message || "Failed to reset budget", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error resetting budget", type: "error" });
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Connecting to Financial Database...</div>;

  return (
    <div className="p-6 text-white max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">TRADE CENTER</h2>
          <p className="text-gray-400">Master List Trading & Portfolio Tracking</p>
        </div>
        <div className="bg-blue-600/20 border border-blue-500/50 p-4 rounded-2xl flex items-center justify-between space-x-4">
          <div>
            <p className="text-xs text-blue-400 uppercase font-bold">Buying Power</p>
            <p className="text-2xl font-mono font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={handleResetBalance}
            title="Reset buying power back to $5,000"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Reset $5k
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border ${message.type === "error" ? "bg-red-900/20 border-red-500 text-red-300" : "bg-green-900/20 border-green-500 text-green-300"}`}>
          {message.text}
        </div>
      )}

      {/* 7-Day Portfolio Performance (Rendered ONLY if user has a portfolio) */}
      {hasPortfolio && performanceData.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Activity size={18} />
                <h3 className="text-xs uppercase font-bold tracking-wider">Portfolio Performance (Last 7 Days)</h3>
              </div>
              <p className="text-2xl font-mono font-bold mt-1">${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${isPositive7d ? "bg-green-900/30 border-green-500/50 text-green-400" : "bg-red-900/30 border-red-500/50 text-red-400"}`}>
              {isPositive7d ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isPositive7d ? "+" : ""}${change7d.toFixed(2)} ({isPositive7d ? "+" : ""}{change7dPct.toFixed(2)}%) 7d</span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive7d ? "#10B981" : "#EF4444"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isPositive7d ? "#10B981" : "#EF4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#9CA3AF"
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `$${val}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#4B5563", borderRadius: "0.75rem", color: "#F9FAFB" }}
                  formatter={(value, name) => [
                    `$${Number(value).toFixed(2)}`,
                    name === "totalValue" ? "Cumulative Portfolio Value" : name,
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="totalValue"
                  name="totalValue"
                  stroke={isPositive7d ? "#10B981" : "#EF4444"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trade Section */}
      <div className="grid gap-4">
        {symbols.map((symbol) => {
          const stock = stocks.find((s) => s.symbol === symbol);
          const owned = getOwnedQuantity(symbol);
          const qtyInput = selectedQuantities[symbol] || "";

          const price = stock ? parseFloat(stock.price) : 0;
          const totalValue = (Number(qtyInput) * price).toFixed(2);

          return (
            <div key={symbol} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-wrap items-center justify-between hover:border-gray-600 transition-all">
              <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
                <h3 className="text-xl font-bold">{symbol}</h3>
                {stock ? (
                  <p className="text-2xl font-mono text-white">${stock.price}</p>
                ) : (
                  <p className="text-sm text-yellow-500 animate-pulse font-mono">FETCHING PRICE...</p>
                )}
                <p className="text-xs text-blue-400 mt-1">Portfolio: {owned} shares</p>
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="text-[10px] text-gray-500 block mb-1">QUANTITY</label>
                <input
                  type="number"
                  placeholder="0"
                  className="bg-gray-900 border border-gray-600 p-2 rounded w-24 text-white outline-none focus:ring-1 focus:ring-blue-500"
                  value={qtyInput}
                  onChange={(e) => handleQuantityChange(symbol, e.target.value)}
                />
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="text-[10px] text-gray-500 block mb-1">ESTIMATED VALUE</label>
                <p className="text-lg font-bold">${totalValue}</p>
              </div>

              <div className="w-full lg:w-1/4 flex space-x-2 mt-4 lg:mt-0">
                <button
                  onClick={() => handleTrade(symbol, "buy")}
                  disabled={!stock || balance < totalValue}
                  className="flex-1 bg-green-600 hover:bg-green-500 p-3 rounded-lg font-bold disabled:opacity-20 transition-all"
                >
                  BUY
                </button>
                <button
                  onClick={() => handleTrade(symbol, "sell")}
                  disabled={owned === 0 || !stock}
                  className="flex-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-lg font-bold disabled:opacity-20 transition-all"
                >
                  SELL
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}