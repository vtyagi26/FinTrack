import React from "react";

function Brokerage() {
  return (
    <div className="container">
      <div className="row px-3 py-5 mt-5 text-center border-top">
        <div className="col-lg-8 col-12 p-4">
          <a href="#" style={{ textDecoration: "none" }}>
            <h3 className="fs-4">Brokerage</h3>
          </a>
          <div
            className="text-muted text-start mt-4"
            style={{ lineHeight: "1.9", fontSize: "14px" }}
          >
            <ul className="ps-3">
              <li>
                Call & Trade and RMS auto-squareoff: Additional charges of ₹50
                +GST per order.
              </li>
              <li>Digital contract notes will be sent via e-mail.</li>
              <li>
                Physical copies of contract notes, if required, shall be charged
                ₹20 per contract note.
              </li>
              <li>Courier charges apply.</li>
              <li>
                For NRI account (non-PIS): 0.5% or ₹100 per executed order for
                equity (whichever is lower).
              </li>
              <li>
                For NRI account (PIS): 0.5% or ₹200 per executed order for
                equity (whichever is lower).
              </li>
              <li>
                If the account is in debit balance, any order placed will be
                charged ₹40 per executed order instead of ₹20 per executed
                order.
              </li>
            </ul>
          </div>
        </div>

        <div className="col-lg-4 col-12 p-4 mt-4 mt-lg-0">
          <a href="#" style={{ textDecoration: "none" }}>
            <h3 className="fs-4">List Of Charges</h3>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Brokerage;