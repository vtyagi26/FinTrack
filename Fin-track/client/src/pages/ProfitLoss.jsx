import { useEffect, useState } from "react";

const ProfitLoss = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPLData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/portfolio/holdings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHoldings(data);
      } catch (err) {
        console.error("Error fetching P&L data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPLData();
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Analyzing P&L...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-2">Profit & Loss Statement</h2>
      <p className="text-gray-400 mb-8">Breakdown of your realized and unrealized performance.</p>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-300 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Buy Price (Avg)</th>
              <th className="px-6 py-4">Sell Price (Current)</th>
              <th className="px-6 py-4">Total Gain/Loss</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {holdings.map((h) => {
              const pnl = (h.currentPrice - h.avgCost) * h.quantity;
              const isPositive = pnl >= 0;

              return (
                <tr key={h.symbol} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 font-bold">{h.symbol}</td>
                  <td className="px-6 py-4 text-gray-400">${h.avgCost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-400">${h.currentPrice.toFixed(2)}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}${pnl.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                      {isPositive ? "PROFIT" : "LOSS"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-xl">
          <h4 className="text-blue-400 font-bold mb-2">What is Unrealized P&L?</h4>
          <p className="text-sm text-gray-400">
            This represents the profit or loss on your current holdings that you haven't sold yet. 
            It changes as the market price fluctuates.
          </p>
        </div>
        <div className="bg-purple-900/10 border border-purple-500/30 p-6 rounded-xl">
          <h4 className="text-purple-400 font-bold mb-2">Tax Tip</h4>
          <p className="text-sm text-gray-400">
            Only "Realized" profits (stocks you have actually sold) are typically subject to capital gains tax.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;