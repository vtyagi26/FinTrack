import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("https://investaflow.onrender.com/verify", {
          withCredentials: true,
        });

        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          throw new Error("User not authenticated");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsAuthenticated(false);
        window.location.href = "https://investa-flow-home.vercel.app/login";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser]);

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;