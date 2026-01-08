import { useState, useEffect } from "react";

export default function BuySell() {
  const [stocks, setStocks] = useState([]);
  const [userHoldings, setUserHoldings] = useState([]); // MongoDB Holdings
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch User Data (Balance) from MongoDB
        const userRes = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userRes.ok) setBalance(userData.balance || 0);

        // 2. Fetch User Holdings from MongoDB
        const holdingsRes = await fetch("http://localhost:5000/api/portfolio/holdings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const holdingsData = await holdingsRes.json();
        if (holdingsRes.ok) setUserHoldings(holdingsData);

        // 3. Pull Market Prices from Cache
        const cachedData = localStorage.getItem("stock_cache_v1");
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setStocks(data);
        } else {
          setStocks([]);
          setMessage({ text: "Please visit Dashboard to sync live prices.", type: "info" });
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [token]);

  // Helper to find how many shares the user owns in MongoDB
  const getOwnedQuantity = (symbol) => {
    const holding = userHoldings.find(h => h.symbol === symbol);
    return holding ? holding.quantity : 0;
  };

  const handleQuantityChange = (symbol, value) => {
    setSelectedQuantities({ ...selectedQuantities, [symbol]: Math.max(0, Number(value)) });
  };

  const handleTrade = async (symbol, type) => {
    const quantity = selectedQuantities[symbol] || 0;
    const liveStock = stocks.find(s => s.symbol === symbol);

    if (!liveStock) {
      setMessage({ text: "Error: Live price unavailable.", type: "error" });
      return;
    }

    const currentPrice = parseFloat(liveStock.price);
    const totalCost = currentPrice * quantity;

    // Frontend Validations before hitting API
    if (quantity <= 0) {
      setMessage({ text: "Please enter a valid quantity.", type: "error" });
      return;
    }

    if (type === "sell" && quantity > getOwnedQuantity(symbol)) {
      setMessage({ text: "You don't own enough shares to sell.", type: "error" });
      return;
    }

    try {
      setMessage({ text: "Processing trade...", type: "info" });

      const res = await fetch("http://localhost:5000/api/trades", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          symbol, 
          quantity: Number(quantity), 
          price: currentPrice, 
          type 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Trade failed");

      // SUCCESS: Refresh Balance and Holdings from MongoDB
      setMessage({ 
        text: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}!`, 
        type: "success" 
      });

      // Update Local State with fresh DB data
      setBalance(data.userBalance); // Assuming your backend sends the new balance back
      
      // Refresh holdings list
      const updatedHoldings = await fetch("http://localhost:5000/api/portfolio/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      setUserHoldings(updatedHoldings);

      setSelectedQuantities({ ...selectedQuantities, [symbol]: "" });

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Syncing with MongoDB...</div>;

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      {/* Wallet Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight">Trade Center</h2>
          <p className="text-gray-400">Trading via Secure MongoDB Instance</p>
        </div>
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-white/10 p-4 rounded-2xl flex items-center space-x-4">
          <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
            <span className="font-bold">$</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Buying Power</p>
            <p className="text-2xl font-mono font-bold text-blue-400">${balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === "error" ? "bg-red-900/20 border-red-500 text-red-200" : 
          message.type === "success" ? "bg-green-900/20 border-green-500 text-green-200" : 
          "bg-blue-900/20 border-blue-500 text-blue-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {stocks.map((stock) => {
          const qty = selectedQuantities[stock.symbol] || "";
          const totalValue = (Number(qty) * parseFloat(stock.price)).toFixed(2);
          const owned = getOwnedQuantity(stock.symbol);

          return (
            <div key={stock.symbol} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-wrap items-center justify-between hover:border-gray-500 transition-all">
              <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
                <h3 className="text-2xl font-bold">{stock.symbol}</h3>
                <p className="text-gray-400">Live Price: <span className="text-white font-mono">${stock.price}</span></p>
                <p className="text-xs text-blue-400 mt-1">You own: <span className="font-bold">{owned} shares</span></p>
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="block text-xs text-gray-400 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  className="bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={qty}
                  onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                />
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="block text-xs text-gray-400 uppercase mb-1">Total Value</label>
                <p className="text-xl font-bold text-white">${totalValue}</p>
              </div>

              <div className="w-full lg:w-1/4 flex space-x-3 mt-4 lg:mt-0">
                <button
                  onClick={() => handleTrade(stock.symbol, "buy")}
                  className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold transition-all"
                >
                  BUY
                </button>
                <button
                  onClick={() => handleTrade(stock.symbol, "sell")}
                  disabled={owned === 0}
                  className="flex-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-20 py-3 rounded-xl font-bold transition-all"
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