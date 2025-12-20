import { useEffect, useState } from "react";

const Invested = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({ invested: 0, current: 0 });

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/portfolio/holdings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch holdings");

        const data = await res.json();
        setHoldings(data);

        // Calculate Portfolio Totals
        const totalInvested = data.reduce((acc, h) => acc + (h.avgCost * h.quantity), 0);
        const totalCurrent = data.reduce((acc, h) => acc + (h.currentPrice * h.quantity), 0);
        
        setTotals({ invested: totalInvested, current: totalCurrent });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const overallPnL = totals.current - totals.invested;
  const pnlPercent = totals.invested > 0 ? (overallPnL / totals.invested) * 100 : 0;

  if (loading) return <div className="p-10 text-center text-white">Loading Portfolio...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-8">Your Investment Portfolio</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <p className="text-gray-400 text-sm uppercase font-semibold">Total Invested</p>
          <p className="text-2xl font-mono">${totals.invested.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <p className="text-gray-400 text-sm uppercase font-semibold">Current Value</p>
          <p className="text-2xl font-mono text-blue-400">${totals.current.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className={`bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg ${overallPnL >= 0 ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
          <p className="text-gray-400 text-sm uppercase font-semibold">Total Profit/Loss</p>
          <p className={`text-2xl font-mono ${overallPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {overallPnL >= 0 ? '+' : ''}${overallPnL.toLocaleString(undefined, {minimumFractionDigits: 2})}
            <span className="text-sm ml-2">({pnlPercent.toFixed(2)}%)</span>
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      {holdings.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-xl border border-dashed border-gray-600">
          <p className="text-gray-400">No stocks found in your portfolio.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50 text-gray-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg. Cost</th>
                  <th className="px-6 py-4">Market Price</th>
                  <th className="px-6 py-4">Invested Value</th>
                  <th className="px-6 py-4">Current Value</th>
                  <th className="px-6 py-4 text-right">Returns (P&L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {holdings.map((h) => {
                  const investedVal = h.quantity * h.avgCost;
                  const currentVal = h.quantity * h.currentPrice;
                  const pnl = currentVal - investedVal;
                  const isPositive = pnl >= 0;

                  return (
                    <tr key={h.symbol} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-400">{h.symbol}</td>
                      <td className="px-6 py-4">{h.quantity}</td>
                      <td className="px-6 py-4 font-mono">${h.avgCost.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono">${h.currentPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-gray-400">${investedVal.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-white font-semibold">${currentVal.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '▲' : '▼'} ${Math.abs(pnl).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invested;