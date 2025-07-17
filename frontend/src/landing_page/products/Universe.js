import React from "react";

function Universe() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1 className="fs-3">The InvestaFlow Universe</h1>
        <p className="text-muted">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>
      </div>

      <div className="row text-center">
        {[
          {
            img: "media/images/investaFlow.png",
            text: "Our asset management venture that is creating simple and transparent index funds to help you save for your goals.",
          },
          {
            img: "media/images/streakLogo.png",
            text: "Systematic trading platform that allows you to create and backtest strategies without coding.",
          },
          {
            img: "media/images/sensibullLogo.svg",
            text: "Options trading platform that lets you create strategies, analyze positions, and examine data points like open interest, FII/DII, and more.",
            style: { width: "50%" },
          },
          {
            img: "media/images/dittoLogo.png",
            text: "Personalized advice on life and health insurance. No spam and no mis-selling. Sign up for free.",
          },
          {
            img: "media/images/tijori.svg",
            text: "Investment research platform that offers detailed insights on stocks, sectors, supply chains, and more.",
          },
          {
            img: "media/images/smallcaseLogo.png",
            text: "Thematic investing platform that helps you invest in diversified baskets of stocks or ETFs.",
          },
        ].map((item, idx) => (
          <div className="col-sm-12 col-md-6 col-lg-4 p-4" key={idx}>
            <img
              src={item.img}
              alt={`Platform ${idx + 1}`}
              style={{
                height: "55px",
                ...(item.style || {}),
              }}
            />
            <p className="text-muted mt-3" style={{ fontSize: "14px" }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-3 mb-5">
        <button className="btn btn-primary px-4 py-2 fs-5">Signup Now</button>
      </div>
    </div>
  );
}

export default Universe;