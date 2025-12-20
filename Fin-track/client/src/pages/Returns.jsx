import { useEffect, useState } from "react";

const Returns = () => {
  const [data, setData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch both summary and individual holdings
        const [summaryRes, holdingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/portfolio/summary", { headers }),
          fetch("http://localhost:5000/api/portfolio/holdings", { headers })
        ]);

        const summaryData = await summaryRes.json();
        const holdingsData = await holdingsRes.json();

        setData(summaryData);
        setHoldings(holdingsData);
      } catch (err) {
        console.error("Error fetching returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Calculating Returns...</div>;

  const isPositive = data?.unrealizedPnL >= 0;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-2">Performance & Returns</h2>
      <p className="text-gray-400 mb-8">Detailed breakdown of your profit and loss statements.</p>

      {/* Hero Return Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl">
        <div>
          <p className="text-gray-400 uppercase text-sm font-bold tracking-widest mb-1">Total Unrealized P&L</p>
          <h3 className={`text-5xl font-black ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}${data?.unrealizedPnL?.toLocaleString()}
          </h3>
        </div>
        <div className="mt-6 md:mt-0 text-right">
          <p className="text-gray-400 text-sm mb-1">Portfolio Return %</p>
          <p className={`text-2xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {((data?.unrealizedPnL / data?.invested) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Profit & Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gainers Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-700/30">
            <h4 className="font-bold text-green-400">Top Performing Gains</h4>
          </div>
          <table className="w-full text-left">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Total Gain</th>
                <th className="px-6 py-4 text-right">Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {holdings
                .filter(h => h.unrealizedPnL > 0)
                .sort((a, b) => b.unrealizedPnL - a.unrealizedPnL)
                .map(h => (
                  <tr key={h.symbol} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-bold">{h.symbol}</td>
                    <td className="px-6 py-4 text-green-400 font-mono">+${h.unrealizedPnL.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-green-500">
                      {((h.unrealizedPnL / (h.avgCost * h.quantity)) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Losers Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-700/30">
            <h4 className="font-bold text-red-400">Underperforming Losses</h4>
          </div>
          <table className="w-full text-left">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Total Loss</th>
                <th className="px-6 py-4 text-right">Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {holdings
                .filter(h => h.unrealizedPnL <= 0)
                .sort((a, b) => a.unrealizedPnL - b.unrealizedPnL)
                .map(h => (
                  <tr key={h.symbol} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-bold">{h.symbol}</td>
                    <td className="px-6 py-4 text-red-400 font-mono">-${Math.abs(h.unrealizedPnL).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-red-500">
                      {((h.unrealizedPnL / (h.avgCost * h.quantity)) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Returns;