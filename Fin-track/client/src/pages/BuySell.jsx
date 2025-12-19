import { useState, useEffect } from "react";

export default function BuySell() {
  const [stocks, setStocks] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Pull real prices from the dashboard cache
    const cachedData = localStorage.getItem("stock_cache_v1");
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      setStocks(data);
    } else {
      // Fallback demo data if cache hasn't loaded yet
      setStocks([
        { symbol: "AAPL", price: "175.00" },
        { symbol: "TSLA", price: "255.00" },
        { symbol: "MSFT", price: "310.00" },
      ]);
    }
    setLoading(false);
  }, []);

  const handleQuantityChange = (symbol, value) => {
    setSelectedQuantities({ ...selectedQuantities, [symbol]: Math.max(0, Number(value)) });
  };

  const handleTrade = async (symbol, type, price) => {
    const quantity = selectedQuantities[symbol] || 0;
    const token = localStorage.getItem("token"); // Used to identify the user on backend

    if (quantity <= 0) {
      setMessage({ text: "Please enter a valid quantity.", type: "error" });
      return;
    }

    try {
      setMessage({ text: "Processing trade...", type: "info" });

      // Change this URL to your actual backend endpoint
      const res = await fetch("http://localhost:5000/api/trades", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          symbol, 
          quantity: Number(quantity), 
          price: parseFloat(price), 
          type // "buy" or "sell"
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Trade failed");

      setMessage({ 
        text: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}!`, 
        type: "success" 
      });

      // Clear input field
      setSelectedQuantities({ ...selectedQuantities, [symbol]: "" });

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Syncing Market Prices...</div>;

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Trade Center</h2>
        <div className="bg-blue-900/30 border border-blue-500/50 px-4 py-2 rounded-lg text-sm">
          Real-time execution enabled
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border animate-pulse ${
          message.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" : 
          message.type === "success" ? "bg-green-900/20 border-green-500 text-green-200" : 
          "bg-blue-900/20 border-blue-500 text-blue-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {stocks.map((stock) => {
          const qty = selectedQuantities[stock.symbol] || 0;
          const totalValue = (qty * parseFloat(stock.price)).toFixed(2);

          return (
            <div key={stock.symbol} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-wrap items-center justify-between hover:border-gray-500 transition-all">
              <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
                <h3 className="text-2xl font-bold">{stock.symbol}</h3>
                <p className="text-gray-400">Current: <span className="text-white font-mono">${stock.price}</span></p>
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="block text-xs text-gray-400 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  className="bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedQuantities[stock.symbol] || ""}
                  onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                />
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="block text-xs text-gray-400 uppercase mb-1">Invested Value</label>
                <p className="text-xl font-bold text-blue-400">${totalValue}</p>
              </div>

              <div className="w-full lg:w-1/4 flex space-x-3 mt-4 lg:mt-0">
                <button
                  onClick={() => handleTrade(stock.symbol, "buy", stock.price)}
                  className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all"
                >
                  BUY
                </button>
                <button
                  onClick={() => handleTrade(stock.symbol, "sell", stock.price)}
                  className="flex-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all"
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