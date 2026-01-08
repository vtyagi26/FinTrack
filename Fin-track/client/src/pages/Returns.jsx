import { useEffect, useState } from "react";

const Returns = () => {
  const [summary, setSummary] = useState({ invested: 0, currentValue: 0, unrealizedPnL: 0 });
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateReturns = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch MongoDB Holdings
        const holdingsRes = await fetch("http://localhost:5000/api/portfolio/holdings", { headers });
        const dbHoldings = await holdingsRes.json();

        // 2. Get Live Prices from Cache
        const cachedData = localStorage.getItem("stock_cache_v1");
        let livePrices = {};
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          data.forEach(s => livePrices[s.symbol] = parseFloat(s.price));
        }

        // 3. Calculate Real-time P&L for each holding
        const calculatedHoldings = dbHoldings.map(h => {
          const currentPrice = livePrices[h.symbol] || h.avgCost; // Fallback to avgCost if no live price
          const investedValue = h.avgCost * h.quantity;
          const currentValue = currentPrice * h.quantity;
          const unrealizedPnL = currentValue - investedValue;
          const returnPercentage = investedValue !== 0 ? (unrealizedPnL / investedValue) * 100 : 0;

          return {
            ...h,
            currentPrice,
            unrealizedPnL,
            returnPercentage
          };
        });

        // 4. Calculate Total Summary
        const totalInvested = calculatedHoldings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0);
        const totalCurrentValue = calculatedHoldings.reduce((sum, h) => sum + (h.currentPrice * h.quantity), 0);
        const totalPnL = totalCurrentValue - totalInvested;

        setHoldings(calculatedHoldings);
        setSummary({
          invested: totalInvested,
          currentValue: totalCurrentValue,
          unrealizedPnL: totalPnL
        });

      } catch (err) {
        console.error("Error fetching returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateReturns();
  }, []);

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Analyzing Market Performance...</div>;

  const isPositive = summary.unrealizedPnL >= 0;
  const totalReturnPercent = summary.invested !== 0 ? (summary.unrealizedPnL / summary.invested) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-2">Performance & Returns</h2>
      <p className="text-gray-400 mb-8">Real-time breakdown of your portfolio growth.</p>

      {/* Hero Return Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black">{isPositive ? "↑" : "↓"}</span>
        </div>
        
        <div className="relative z-10">
          <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Total Portfolio P&L</p>
          <h3 className={`text-6xl font-black ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}${summary.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
        
        <div className="mt-6 md:mt-0 text-center md:text-right relative z-10">
          <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Return</p>
          <p className={`text-4xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {totalReturnPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Profit & Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gainers Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-700 bg-green-500/10">
            <h4 className="font-bold text-green-400 flex items-center">
              <span className="mr-2">📈</span> Top Performing Assets
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="text-[10px] text-gray-500 uppercase tracking-wider bg-gray-900/30">
                <tr>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Gain</th>
                    <th className="px-6 py-4 text-right">Return %</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                {holdings
                    .filter(h => h.unrealizedPnL > 0)
                    .sort((a, b) => b.returnPercentage - a.returnPercentage)
                    .map(h => (
                    <tr key={h.symbol} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{h.symbol}</td>
                        <td className="px-6 py-4 text-green-400 font-mono">+${h.unrealizedPnL.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-green-500 font-bold">
                        +{h.returnPercentage.toFixed(2)}%
                        </td>
                    </tr>
                    ))}
                {holdings.filter(h => h.unrealizedPnL > 0).length === 0 && (
                    <tr><td colSpan="3" className="p-10 text-center text-gray-500 italic">No gainers in portfolio yet.</td></tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

        {/* Losers Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-700 bg-red-500/10">
            <h4 className="font-bold text-red-400 flex items-center">
              <span className="mr-2">📉</span> Underperforming Assets
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="text-[10px] text-gray-500 uppercase tracking-wider bg-gray-900/30">
                <tr>
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Loss</th>
                    <th className="px-6 py-4 text-right">Return %</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                {holdings
                    .filter(h => h.unrealizedPnL <= 0)
                    .sort((a, b) => a.returnPercentage - b.returnPercentage)
                    .map(h => (
                    <tr key={h.symbol} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{h.symbol}</td>
                        <td className="px-6 py-4 text-red-400 font-mono">-${Math.abs(h.unrealizedPnL).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-red-500 font-bold">
                        {h.returnPercentage.toFixed(2)}%
                        </td>
                    </tr>
                    ))}
                {holdings.filter(h => h.unrealizedPnL <= 0).length === 0 && (
                    <tr><td colSpan="3" className="p-10 text-center text-gray-500 italic">No underperforming assets.</td></tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Returns;