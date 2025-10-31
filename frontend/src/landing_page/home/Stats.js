import React from "react";
import "../Styles/Stats.css";

function Stats() {
  const newsItems = [
    "📉 Sensex drops 350 points as tech stocks slide",
    "📈 Nifty hits all-time high on banking rally",
    "💸 Foreign investors pump ₹12,000 crore into Indian markets",
    "⚡ Reliance shares surge after quarterly earnings beat estimates",
    "📊 Gold prices rise as inflation concerns grow",
    "🔍 RBI holds repo rate steady for the third consecutive quarter"
  ];

  return (
    <div className="stock-news-carousel py-5">
      <div className="container text-center">
        <h2 className="mb-4 glowing-title">📢 Latest Stock Market Headlines</h2>
        <div
          id="carouselNews"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
        >
          <div className="carousel-inner">
            {newsItems.map((news, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <h4 className="news-text">{news}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
