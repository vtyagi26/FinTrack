import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="container p-5 mt-5">
      <div className="row text-center">
        <h1 className="mt-3 p-2">404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link
          to="/"
          className="btn btn-primary mt-3"
          style={{ width: "150px", margin: "0 auto" }}
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;