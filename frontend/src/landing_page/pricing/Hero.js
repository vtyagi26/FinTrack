import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row px-3 py-5 mt-5 mb-5 border-bottom text-center">
        <h1 className="fs-2">Pricing</h1>
        <h3 className="text-muted fs-5 mt-3">List of all charges and taxes</h3>
      </div>

      <div className="row px-3 py-4 mt-4">
        <div className="col-lg-4 col-md-6 col-12 p-3">
          <div className="text-center h-100 border rounded p-4">
            <img
              src="media/images/pricingEquity.svg"
              alt="Free equity delivery"
              className="img-fluid mb-3"
              style={{ maxHeight: "100px" }}
            />
            <h2 className="fs-5" style={{ color: "#424242" }}>
              Free equity delivery
            </h2>
            <p className="mt-2 small">
              All equity delivery investments (NSE, BSE), are absolutely free —
              ₹ 0 brokerage.
            </p>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 col-12 p-3">
          <div className="text-center h-100 border rounded p-4">
            <img
              src="media/images/intradayTrades.svg"
              alt="Intraday and F&O"
              className="img-fluid mb-3"
              style={{ maxHeight: "100px" }}
            />
            <h2 className="fs-5" style={{ color: "#424242" }}>
              Intraday and F&O trades
            </h2>
            <p className="mt-2 small">
              Flat ₹ 20 or 0.03% (whichever is lower) per executed order on
              intraday trades across equity, currency, and commodity trades.
              Flat ₹20 on all option trades.
            </p>
          </div>
        </div>

        <div className="col-lg-4 col-md-12 col-12 p-3">
          <div className="text-center h-100 border rounded p-4">
            <img
              src="media/images/pricingEquity.svg"
              alt="Free direct MF"
              className="img-fluid mb-3"
              style={{ maxHeight: "100px" }}
            />
            <h2 className="fs-5" style={{ color: "#424242" }}>
              Free direct MF
            </h2>
            <p className="mt-2 small">
              All direct mutual fund investments are absolutely free — ₹ 0
              commissions & DP charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;