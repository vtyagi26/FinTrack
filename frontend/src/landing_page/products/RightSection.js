import React from "react";

function RightSection({ imageURL, productName, productDesription, learnMore }) {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-md-6 order-2 order-md-1 p-4">
          <h1 className="fs-3">{productName}</h1>
          <p className="text-muted">{productDesription}</p>
          <a href={learnMore} style={{ textDecoration: "none" }}>
            Learn More <i className="fa-solid fa-arrow-right-long"></i>
          </a>
        </div>

        <div className="col-md-6 order-1 order-md-2 text-center">
          <img
            src={imageURL}
            alt={productName}
            style={{ width: "90%", maxWidth: "400px" }}
            className="img-fluid"
          />
        </div>
      </div>
    </div>
  );
}

export default RightSection;