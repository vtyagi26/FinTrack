import React from "react";
import IndexDisplay from "./IndexDisplay";
import "./Styles/Summary.css";

const Summary = () => {
  return (
    <div className="summary-container">
      <div className="headersummary">
        <h2>Welcome back,👋</h2>
        <p>Here’s a snapshot of the top global stocks</p>
      </div>

      <IndexDisplay />

      <div className="section-divider" />

      <div
        className="summary-section d-flex flex-wrap justify-content-between"
        style={{ gap: "1rem" }}
      >
        <div className="card flex-grow-1" style={{ minWidth: "250px" }}>
          <h4>Total Investment</h4>
          <p>₹29,875.55</p>
        </div>
        <div className="card flex-grow-1" style={{ minWidth: "250px" }}>
          <h4>Current Value</h4>
          <p>₹31,428.95</p>
        </div>
        <div className="card flex-grow-1" style={{ minWidth: "250px" }}>
          <h4>Net P&L</h4>
          <p className="up">+₹1,553.40 (5.20%)</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;