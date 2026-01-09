import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

export default function TransactionHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/trades/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setTrades(data);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Loading ledger...</div>;

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Transaction History</h2>
        <p className="text-gray-400">All your buy and sell activities recorded on the blockchain (MongoDB).</p>
      </header>

      {trades.length === 0 ? (
        <div className="bg-gray-800 border border-dashed border-gray-700 p-20 text-center rounded-3xl">
          <p className="text-gray-500">No transactions found. Go make some trades!</p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th className="p-5">Type</th>
                <th className="p-5">Asset</th>
                <th className="p-5">Quantity</th>
                <th className="p-5">Price</th>
                <th className="p-5">Total Value</th>
                <th className="p-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {trades.map((trade) => {
                const isBuy = trade.type === "buy";
                const totalValue = (trade.quantity * trade.price).toFixed(2);
                const date = new Date(trade.createdAt).toLocaleDateString();
                const time = new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={trade._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-5">
                      <span className={`flex items-center space-x-2 font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                        {isBuy ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        <span className="uppercase">{trade.type}</span>
                      </span>
                    </td>
                    <td className="p-5 font-bold text-white">{trade.symbol}</td>
                    <td className="p-5 font-mono">{trade.quantity}</td>
                    <td className="p-5 font-mono text-gray-300">${trade.price.toFixed(2)}</td>
                    <td className="p-5 font-bold text-white">${totalValue}</td>
                    <td className="p-5">
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-300">{date}</span>
                        <span className="text-gray-500 flex items-center mt-1">
                          <Clock size={10} className="mr-1" /> {time}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}