import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useGeneralContext } from "./GeneralContext";
import "./Styles/BuyActionWindow.css"; // reuse styling

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const { closeActionWindow } = useGeneralContext();

  const handleSellClick = async () => {
    try {
      await axios.post("https://investaflow.onrender.com/newOrder", {
        uid,
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: "SELL",
      });
      closeActionWindow();
    } catch (err) {
      console.error("Error placing sell order:", err);
      alert("Something went wrong while placing sell order.");
    }
  };

  const handleCancelClick = () => {
    closeActionWindow();
  };

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="header" style={{ background: "#dc3545" }}>
        <h3>Sell {uid}</h3>
        <p className="market-options">Quick sell for {uid} stock</p>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Stock</legend>
            <input
              type="text"
              name="stockName"
              id="stockName"
              value={uid}
              disabled
              style={{
                color: "#333",
                fontWeight: "600",
                backgroundColor: "#f2f2f2",
              }}
            />
          </fieldset>
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Estimated return ₹{(stockPrice * stockQuantity).toFixed(2)}</span>
        <div>
          <Link className="btn btn-blue" onClick={handleSellClick}>
            Sell
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;