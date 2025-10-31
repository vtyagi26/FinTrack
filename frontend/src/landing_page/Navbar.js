import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg border-bottom"
      style={{
        backgroundColor: "black",
        paddingTop: "10px", // reduced
        paddingBottom: "10px", // reduced
      }}
    >
      <div className="container px-4">
        <Link className="navbar-brand" to="/">
          <img
            src="/media/images/logo.png"
            alt="Logo"
            style={{ height: "90px", objectFit: "contain" }} // better height control
          />
        </Link>

        <button
          className="navbar-toggler text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav d-flex gap-3 align-items-center">
            {[
              { path: "/signup", label: "Sign Up" },
              { path: "/about", label: "About" },
              { path: "/product", label: "Product" },
              { path: "/pricing", label: "Pricing" },
              { path: "/support", label: "Support" },
            ].map(({ path, label }, idx) => (
              <li className="nav-item" key={idx}>
                <Link
                  className="nav-link text-white fw-medium px-4 py-2 rounded-pill"
                  to={path}
                  style={{
                    backgroundColor: "#1a1a1a",
                    transition: "all 0.3s ease",
                    border: "1px solid transparent",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#2c2c2c";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a1a1a";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
