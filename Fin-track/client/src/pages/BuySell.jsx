import { useState } from "react";

const demoStocks = [
  { symbol: "AAPL", open: 170, close: 175 },
  { symbol: "TSLA", open: 250, close: 255 },
  { symbol: "MSFT", open: 300, close: 310 },
];

export default function BuySell() {
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [message, setMessage] = useState("");

  const handleQuantityChange = (symbol, value) => {
    setSelectedQuantities({ ...selectedQuantities, [symbol]: Number(value) });
  };

  const handleTrade = async (symbol, type, price) => {
    const quantity = selectedQuantities[symbol] || 0;
    if (quantity <= 0) {
      setMessage("Please enter a valid quantity.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId"); // or from your auth context
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, symbol, quantity, price, type }),
      });

      if (!res.ok) throw new Error("Trade failed");
      const data = await res.json();
      setMessage(`${type.toUpperCase()} successful for ${symbol} (${quantity} shares)`);
      console.log(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Buy / Sell Demo Stocks</h2>
      {message && <p className="mb-4 text-yellow-400">{message}</p>}

      <table className="table-auto w-full border border-gray-700 text-center">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Open</th>
            <th className="px-4 py-2">Close</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {demoStocks.map((stock) => (
            <tr key={stock.symbol} className="border-t border-gray-700">
              <td className="px-4 py-2">{stock.symbol}</td>
              <td className="px-4 py-2">{stock.open}</td>
              <td className="px-4 py-2">{stock.close}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  className="w-20 text-black px-2 py-1 rounded"
                  value={selectedQuantities[stock.symbol] || ""}
                  onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                />
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => handleTrade(stock.symbol, "buy", stock.close)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleTrade(stock.symbol, "sell", stock.close)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Sell
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
