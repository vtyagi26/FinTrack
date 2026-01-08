import { useState, useEffect } from "react";

export default function BuySell() {
  const [stocks, setStocks] = useState([]);
  const [userHoldings, setUserHoldings] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const token = localStorage.getItem("token");
  // MASTER LIST: These will always show up in the UI now
  const symbols = ["AAPL", "MSFT", "TSLA"]; 
  const CACHE_KEY = "stock_cache_v1";

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // 1. Fetch User Profile & Holdings from MongoDB
        const [userRes, holdingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users/profile", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch("http://localhost:5000/api/portfolio/holdings", { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setBalance(userData.balance || 0);
        }
        if (holdingsRes.ok) {
          const holdingsData = await holdingsRes.json();
          setUserHoldings(holdingsData);
        }

        // 2. Load Prices from Cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setStocks(data);
        }
        
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [token]);

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
      setMessage({ text: "Cannot trade: Price not synced yet.", type: "error" });
      return;
    }

    const currentPrice = parseFloat(liveStock.price);
    const totalCost = currentPrice * quantity;

    if (quantity <= 0) return setMessage({ text: "Please enter a quantity", type: "error" });
    
    if (type === "buy" && totalCost > balance) {
      return setMessage({ text: "Insufficient buying power", type: "error" });
    }

    if (type === "sell" && quantity > getOwnedQuantity(symbol)) {
      return setMessage({ text: "Insufficient shares owned", type: "error" });
    }

    try {
      setMessage({ text: "Executing Trade on MongoDB...", type: "info" });
      const res = await fetch("http://localhost:5000/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol, quantity: Number(quantity), price: currentPrice, type }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Success Updates
      setBalance(data.userBalance);
      setMessage({ text: `Successfully ${type} ${quantity} shares of ${symbol}`, type: "success" });

      // Refresh Holdings
      const hRes = await fetch("http://localhost:5000/api/portfolio/holdings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserHoldings(await hRes.json());
      setSelectedQuantities({ ...selectedQuantities, [symbol]: "" });

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Connecting to Financial Database...</div>;

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">TRADE CENTER</h2>
          <p className="text-gray-400">Master List Trading</p>
        </div>
        <div className="bg-blue-600/20 border border-blue-500/50 p-4 rounded-2xl">
          <p className="text-xs text-blue-400 uppercase font-bold">Buying Power</p>
          <p className="text-2xl font-mono font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${message.type === "error" ? "bg-red-900/20 border-red-500" : "bg-green-900/20 border-green-500"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4">
        {symbols.map((symbol) => {
          // Find the live data in our state
          const stock = stocks.find((s) => s.symbol === symbol);
          const owned = getOwnedQuantity(symbol);
          const qtyInput = selectedQuantities[symbol] || "";
          
          const price = stock ? parseFloat(stock.price) : 0;
          const totalValue = (Number(qtyInput) * price).toFixed(2);

          return (
            <div key={symbol} className="bg-gray-800 border border-gray-700 p-6 rounded-xl flex flex-wrap items-center justify-between hover:border-gray-600 transition-all">
              <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
                <h3 className="text-xl font-bold">{symbol}</h3>
                {stock ? (
                  <p className="text-2xl font-mono text-white">${stock.price}</p>
                ) : (
                  <p className="text-sm text-yellow-500 animate-pulse font-mono">FETCHING PRICE...</p>
                )}
                <p className="text-xs text-blue-400 mt-1">Portfolio: {owned} shares</p>
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="text-[10px] text-gray-500 block mb-1">QUANTITY</label>
                <input
                  type="number"
                  placeholder="0"
                  className="bg-gray-900 border border-gray-600 p-2 rounded w-24 text-white outline-none focus:ring-1 focus:ring-blue-500"
                  value={qtyInput}
                  onChange={(e) => handleQuantityChange(symbol, e.target.value)}
                />
              </div>

              <div className="w-1/2 lg:w-1/4">
                <label className="text-[10px] text-gray-500 block mb-1">ESTIMATED VALUE</label>
                <p className="text-lg font-bold">${totalValue}</p>
              </div>

              <div className="w-full lg:w-1/4 flex space-x-2 mt-4 lg:mt-0">
                <button 
                  onClick={() => handleTrade(symbol, "buy")} 
                  disabled={!stock || balance < totalValue}
                  className="flex-1 bg-green-600 hover:bg-green-500 p-3 rounded-lg font-bold disabled:opacity-20 transition-all"
                >
                  BUY
                </button>
                <button 
                  onClick={() => handleTrade(symbol, "sell")} 
                  disabled={owned === 0 || !stock} 
                  className="flex-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-lg font-bold disabled:opacity-20 transition-all"
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