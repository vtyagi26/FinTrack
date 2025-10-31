import React, { useState, useEffect } from "react";
import axios from "axios";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);

  useEffect(() => {
    axios.get("https://investaflow.onrender.com/allPositions").then((res) => {
      setAllPositions(res.data);
    });
  }, []);

  return (
    <div className="container-fluid px-3">
      <h3 className="title mb-3">Positions ({allPositions.length})</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle text-center">
          <thead className="table-light">
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Instrument</th>
              <th scope="col">Qty.</th>
              <th scope="col">Avg.</th>
              <th scope="col">LTP</th>
              <th scope="col">P&L</th>
              <th scope="col">Chg.</th>
            </tr>
          </thead>
          <tbody>
            {allPositions.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit
                ? "text-success fw-semibold"
                : "text-danger fw-semibold";
              const dayClass = stock.isLoss ? "text-danger" : "text-success";

              return (
                <tr key={index}>
                  <td>{stock.product}</td>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{stock.price.toFixed(2)}</td>
                  <td className={profClass}>
                    {(curValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={dayClass}>{stock.day}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Positions;