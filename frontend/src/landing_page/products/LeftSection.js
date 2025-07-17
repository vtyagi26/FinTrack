import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDesription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-12 col-md-6 mb-4 mb-md-0 text-center">
          <img
            src={imageURL}
            alt={productName}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <div className="col-12 col-md-6 p-3 p-md-5">
          <h1>{productName}</h1>
          <p>{productDesription}</p>

          <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
            <a href={tryDemo} style={{ textDecoration: "none" }}>
              Try Demo <i className="fa-solid fa-arrow-right-long"></i>
            </a>
            <a href={learnMore} style={{ textDecoration: "none" }}>
              Learn More <i className="fa-solid fa-arrow-right-long"></i>
            </a>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-start gap-3">
            <a href={googlePlay}>
              <img
                src="media/images/googlePlayBadge.svg"
                alt="Google Play"
                style={{ height: "40px" }}
              />
            </a>
            <a href={appStore}>
              <img
                src="media/images/appstoreBadge.svg"
                alt="App Store"
                style={{ height: "40px" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;