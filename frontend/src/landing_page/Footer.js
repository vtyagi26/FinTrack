import React from "react";

function Footer() {
  const linkStyle = {
    textDecoration: "none",
    color: "white",
    transition: "color 0.3s ease",
  };

  return (
    <footer style={{ backgroundColor: "black" }} className="border-top py-4">
      <div className="container text-center">
        <img
          src="./media/images/logo.png"
          alt="Fin-Track Logo"
          style={{ width: "120px", marginBottom: "10px" }}
        />
        <p className="mb-2 text-white">&copy; 2025 FinTrack Ltd. All rights reserved.</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {["Contact Us", "Support", "Privacy Policy", "Terms of Use"].map((item, idx) => (
            <a
              key={idx}
              href="#"
              style={linkStyle}
              onMouseOver={(e) => (e.target.style.color = "#d1e0ff")}
              onMouseOut={(e) => (e.target.style.color = "white")}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
