import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "./Signup.css";

const Signup = () => {
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);

  const { email, password, username } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const handleError = (err) =>
    toast.error(err, { position: "bottom-left", autoClose: 3000 });

  const handleSuccess = (msg) =>
    toast.success(msg, { position: "bottom-right", autoClose: 2000 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/signup`,
        inputValue,
        { withCredentials: true }
      );

      console.log("Signup response:", data);

      if (data?.success) {
        handleSuccess(data.message || "Signup successful");
        setTimeout(() => {
          window.location.href = `${process.env.REACT_APP_DASHBOARD_URL}/dashboard`;
        }, 2000);
        setInputValue({ email: "", password: "", username: "" });
      } else {
        handleError(data?.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      const backendMsg =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      handleError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {loading ? (
        <div className="spinner-container">
          <div className="spinner" />
          <p>Creating your account...</p>
        </div>
      ) : (
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <h2>Create Account</h2>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              placeholder="Enter your username"
              onChange={handleOnChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>

          <p className="redirect-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default Signup;