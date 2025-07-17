import React from "react";
import "../Styles/Education.css";

function Education() {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 mb-4 mb-md-0 text-center">
          <img
            src="media/images/im2.jpg"
            alt="Stock Trading Facts"
            className="img-fluid"
            style={{ maxWidth: "75%" }}
          />
        </div>

        <div className="col-12 col-md-6 text-center text-md-start">
          <h1 className="fs-2">3 Key Facts About Stock Trading</h1>

          <ul className="text-muted mt-4" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li className="mb-3">
              📈 <strong>Stock prices are driven by supply and demand.</strong> 
              When more people want a stock, its price rises; when fewer do, it falls.
            </li>

            <li className="mb-3">
              🕒 <strong>Timing the market is nearly impossible.</strong>
              Even expert investors focus on long-term strategies over short-term predictions.
            </li>

            <li className="mb-3">
              📊 <strong>Diversification reduces risk.</strong>
              Investing in a range of stocks helps protect your portfolio from sudden losses.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Education;
