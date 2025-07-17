import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Styles/IndexDisplay.css";

const API_KEY = process.env.REACT_APP_API_KEY;
const symbols = ["AAPL", "MSFT", "TSLA"];

const IndexDisplay = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStockQuotes = async () => {
      try {
        const responses = await Promise.all(
          symbols.map((symbol) =>
            axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
            )
          )
        );

        const data = responses.map((res, i) => ({
          symbol: symbols[i],
          price: res.data.c,
          change: res.data.d,
          percent: res.data.dp,
        }));

        setStocks(data);
      } catch (err) {
        console.error("❌ Failed to fetch stock data", err);
      }
    };

    fetchStockQuotes();
  }, []);

  return (
    <div className="container-fluid px-3 px-md-5">
      <div className="row g-3">
        {stocks.map((stock, index) => {
          const isUp = stock.change >= 0;
          return (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-4 d-flex justify-content-center"
            >
              <div className="stock-card text-center">
                <h3>{stock.symbol}</h3>
                <p className="price">₹{stock.price?.toFixed(2)}</p>
                <p className={`change ${isUp ? "up" : "down"}`}>
                  {isUp ? "▲" : "▼"} {stock.percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndexDisplay;