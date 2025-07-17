import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <div className="container p-5 mt-5">
      <div className="row text-center">
        <h1 className="mt-3 p-2">Open an account</h1>
        <p>
          Modern platform for your trading overview!
        </p>
        <Link to="/signup" style={{ width: "20%", margin: "0 auto" }}>
          <button className="p-2 btn btn-primary fs-5 mt-3 w-100">
            Sign Up Now
          </button>
        </Link>
      </div>
    </div>
  );
}

export default OpenAccount;