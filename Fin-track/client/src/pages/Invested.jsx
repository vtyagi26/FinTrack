import { useState, useEffect } from "react";
import { TrendingUp, Wallet, Banknote, BarChart2 } from "lucide-react";

export default function Invested() {
  const [holdings, setHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch current holdings and trade history simultaneously
        const [holdingsRes, historyRes] = await Promise.all([
          fetch("http://localhost:5000/api/portfolio/holdings", { headers }),
          fetch("http://localhost:5000/api/trades/history", { headers })
        ]);

        const dbHoldings = await holdingsRes.json();
        const tradeHistory = await historyRes.json();

        // 2. Calculate Realized P/L from history
        // Summing the 'realizedPnL' field from every 'sell' transaction
        const totalRealized = tradeHistory.reduce((sum, trade) => {
          return sum + (Number(trade.realizedPnL) || 0);
        }, 0);

        setHoldings(dbHoldings);
        setRealizedPnL(totalRealized);

        // 3. Get Live Prices from Dashboard Cache
        const cachedData = localStorage.getItem("stock_cache_v1");
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          const priceMap = {};
          data.forEach(s => priceMap[s.symbol] = parseFloat(s.price));
          setLivePrices(priceMap);
        }
      } catch (err) {
        console.error("Failed to load portfolio statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  // --- CALCULATIONS FOR SUMMARY ---
  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0);
  const currentTotalValue = holdings.reduce((sum, h) => {
    const livePrice = livePrices[h.symbol] || h.avgCost;
    return sum + (livePrice * h.quantity);
  }, 0);
  const unrealizedPnL = currentTotalValue - totalInvested;

  if (loading) return (
    <div className="p-10 text-center text-white animate-pulse">
      Crunching portfolio data...
    </div>
  );

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Invested Assets</h2>
        <p className="text-gray-400">Manage your active positions and track performance.</p>
      </header>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2 text-blue-400">
            <Wallet size={18} />
            <p className="text-xs uppercase font-bold tracking-wider">Total Invested</p>
          </div>
          <p className="text-2xl font-mono font-bold">${totalInvested.toFixed(2)}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2 text-indigo-400">
            <BarChart2 size={18} />
            <p className="text-xs uppercase font-bold tracking-wider">Current Value</p>
          </div>
          <p className="text-2xl font-mono font-bold">${currentTotalValue.toFixed(2)}</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2 text-yellow-400">
            <TrendingUp size={18} />
            <p className="text-xs uppercase font-bold tracking-wider">Unrealized P&L</p>
          </div>
          <p className={`text-2xl font-mono font-bold ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2 text-emerald-400">
            <Banknote size={18} />
            <p className="text-xs uppercase font-bold tracking-wider">Realized P&L</p>
          </div>
          <p className={`text-2xl font-mono font-bold ${realizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {/* --- HOLDINGS TABLE --- */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="p-5">Instrument</th>
              <th className="p-5">Qty</th>
              <th className="p-5">Avg. Cost</th>
              <th className="p-5">LTP (Live)</th>
              <th className="p-5">Current Value</th>
              <th className="p-5 text-right">P&L (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-500 italic">No active holdings found.</td>
              </tr>
            ) : (
              holdings.map((h) => {
                const livePrice = livePrices[h.symbol] || h.avgCost;
                const pnl = (livePrice - h.avgCost) * h.quantity;
                const pnlPercent = ((livePrice - h.avgCost) / h.avgCost) * 100;

                return (
                  <tr key={h.symbol} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-5 font-bold text-blue-400">{h.symbol}</td>
                    <td className="p-5 font-mono">{h.quantity}</td>
                    <td className="p-5 font-mono text-gray-300">${h.avgCost.toFixed(2)}</td>
                    <td className="p-5 font-mono text-white">${livePrice.toFixed(2)}</td>
                    <td className="p-5 font-mono font-bold">${(livePrice * h.quantity).toFixed(2)}</td>
                    <td className={`p-5 text-right font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}