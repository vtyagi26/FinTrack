import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Hero.css";

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="container p-5">
      <div className="row text-center justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <h1 className="mt-3 hero-heading">Invest In Everything</h1>
          <p className="hero-subtext">
            Online platform to invest in stocks, derivatives, mutual funds, and more
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="btn btn-primary hero-button"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
