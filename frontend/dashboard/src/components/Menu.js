import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import "./Styles/Menu.css";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, setUser } = useUser();

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      toast.success("Logged out successfully", {
        position: "bottom-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        window.location.href = "https://investa-flow-home.vercel.app/login";
      }, 2000);
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.", {
        position: "bottom-left",
        autoClose: 3000,
      });
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Orders", path: "/dashboard/Orders" },
    { label: "Holdings", path: "/dashboard/holdings" },
    { label: "Positions", path: "/dashboard/positions" },
    { label: "Funds", path: "/dashboard/funds" },
  ];

  return (
    <div className="menu-container px-3 py-2">
      <div className="d-none d-md-flex align-items-center justify-content-between w-100">
        <img src="/investaFlow.png" alt="Logo" style={{ width: "120px" }} />
        <div className="d-flex gap-3 align-items-center">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => handleMenuClick(index)}
              className="text-decoration-none"
            >
              <p className={selectedMenu === index ? "menu selected" : "menu"}>
                {item.label}
              </p>
            </Link>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2">
          <p className="menu fw-bold mb-0">{user?.username || "Loading..."}</p>
          <span
            onClick={handleLogout}
            className="px-2 py-1"
            style={{
              fontSize: "0.8rem",
              fontWeight: "400",
              color: "rgb(70, 70, 70)",
              border: "1px solid black",
              borderRadius: "2px",
              cursor: "pointer",
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleLogout();
            }}
          >
            Logout
          </span>
        </div>
      </div>
      <div className="d-flex d-md-none justify-content-between align-items-center w-100 mt-5 ">
        <img src="/investaFlow.png" alt="Logo" style={{ width: "100px" }} />
        <p className="menu fw-bold mb-0">{user?.username || "Loading..."}</p>
        <div
          className="dropdown-toggle-icon"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          ☰
        </div>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-menu-mobile">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="dropdown-link"
              onClick={() => {
                handleMenuClick(index);
                setIsDropdownOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
      <div className="d-md-none mt-1 text-end mb-5">
        <span
          onClick={handleLogout}
          className="px-2 py-1"
          style={{
            fontSize: "0.8rem",
            fontWeight: "400",
            color: "rgb(70, 70, 70)",
            border: "1px solid black",
            borderRadius: "2px",
            cursor: "pointer",
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleLogout();
          }}
        >
          Logout
        </span>
      </div>
    </div>
  );
};

export default Menu;