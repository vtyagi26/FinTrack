import { useState, useEffect } from "react";

export default function Invested() {
  const [holdings, setHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch current holdings from MongoDB
        const res = await fetch("http://localhost:5000/api/portfolio/holdings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dbHoldings = await res.json();
        setHoldings(dbHoldings);

        // 2. Get Live Prices from the Dashboard's Cache
        const cachedData = localStorage.getItem("stock_cache_v1");
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          // Convert array to a lookup object { AAPL: 175.20, TSLA: 250.00 }
          const priceMap = {};
          data.forEach(s => priceMap[s.symbol] = parseFloat(s.price));
          setLivePrices(priceMap);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // --- CALCULATIONS ---
  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0);
  const currentTotalValue = holdings.reduce((sum, h) => {
    const livePrice = livePrices[h.symbol] || h.avgCost; // Fallback to cost if price missing
    return sum + (livePrice * h.quantity);
  }, 0);
  const totalPnL = currentTotalValue - totalInvested;

  if (loading) return <div className="p-10 text-center text-white">Loading Portfolio...</div>;

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">Your Holdings</h2>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm uppercase font-bold">Total Invested</p>
          <p className="text-2xl font-mono">${totalInvested.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm uppercase font-bold">Current Value</p>
          <p className="text-2xl font-mono">${currentTotalValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-sm uppercase font-bold">Unrealized P&L</p>
          <p className={`text-2xl font-mono ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="overflow-hidden bg-gray-800 border border-gray-700 rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4">Asset</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Avg Cost</th>
              <th className="p-4">Live Price</th>
              <th className="p-4">Profit/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {holdings.map((h) => {
              const livePrice = livePrices[h.symbol] || "N/A";
              const pnl = livePrice !== "N/A" ? (livePrice - h.avgCost) * h.quantity : 0;
              
              return (
                <tr key={h.symbol} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4 font-bold text-blue-400">{h.symbol}</td>
                  <td className="p-4">{h.quantity}</td>
                  <td className="p-4 font-mono">${h.avgCost.toFixed(2)}</td>
                  <td className="p-4 font-mono text-white">${livePrice}</td>
                  <td className={`p-4 font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}