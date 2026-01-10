import { useState, useEffect } from "react";
import { Plus, Trash2, Bell, TrendingUp, TrendingDown, Search } from "lucide-react";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setWatchlist(data);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    try {
      const res = await fetch("http://localhost:5000/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          upperLimit: Number(upperLimit) || null,
          lowerLimit: Number(lowerLimit) || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `${symbol.toUpperCase()} added to watchlist!`, type: "success" });
        setSymbol("");
        setUpperLimit("");
        setLowerLimit("");
        fetchWatchlist();
      } else {
        setMessage({ text: data.message || "Failed to add stock", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/watchlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatchlist(watchlist.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Loading Watchlist...</div>;

  return (
    <div className="p-8 text-white max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Price Watchlist</h2>
        <p className="text-gray-400">Set price triggers and receive alerts when limits are hit.</p>
      </header>

      {/* --- ADD TO WATCHLIST FORM --- */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mb-10">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Plus size={20} className="mr-2 text-blue-500" /> Add New Trigger
        </h3>
        <form onSubmit={handleAddToWatchlist} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Symbol</label>
            <div className="relative">
              <input
                type="text"
                placeholder="AAPL"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Upper Limit ($)</label>
            <input
              type="number"
              placeholder="e.g. 200"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={upperLimit}
              onChange={(e) => setUpperLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Lower Limit ($)</label>
            <input
              type="number"
              placeholder="e.g. 150"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={lowerLimit}
              onChange={(e) => setLowerLimit(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all"
          >
            Create Alert
          </button>
        </form>
        {message.text && (
          <p className={`mt-4 text-sm font-medium ${message.type === "error" ? "text-red-400" : "text-green-400"}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* --- WATCHLIST TABLE --- */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="p-5">Asset</th>
              <th className="p-5">Upper Trigger</th>
              <th className="p-5">Lower Trigger</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {watchlist.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500 italic">
                  Your watchlist is empty. Add a stock to start monitoring.
                </td>
              </tr>
            ) : (
              watchlist.map((item) => (
                <tr key={item._id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-5 font-bold text-white flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 text-blue-400 text-xs">
                      {item.symbol[0]}
                    </div>
                    {item.symbol}
                  </td>
                  <td className="p-5">
                    <span className="flex items-center text-green-400 font-mono">
                      <TrendingUp size={14} className="mr-2" />
                      {item.upperLimit ? `$${item.upperLimit.toFixed(2)}` : "—"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="flex items-center text-red-400 font-mono">
                      <TrendingDown size={14} className="mr-2" />
                      {item.lowerLimit ? `$${item.lowerLimit.toFixed(2)}` : "—"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
                      Active Monitoring
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => removeFromWatchlist(item._id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}