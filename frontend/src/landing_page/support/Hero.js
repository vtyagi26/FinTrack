import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5 text-center text-md-start" id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="">Track Tickets</a>
      </div>

      <div className="row p-4 m-3">
        <div className="col-12 col-md-6 p-3 mb-4">
          <h1 className="mb-4 fs-5">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input
            placeholder="Eg. how do I activate F&O"
            className="form-control mb-3"
            type="text"
            aria-label="Search support"
          />
          <div className="d-flex flex-wrap gap-2">
            <a href="">Track account opening</a>
            <a href="">Track segment activation</a>
            <a href="">Intraday margins</a>
            <a href="">Kite user manual</a>
          </div>
        </div>
        <div className="col-12 col-md-6 p-3">
          <h1 className="mb-4 fs-6">Featured</h1>
          <ol>
            <li className="mb-2">
              <a href="">Current Takeovers and Delisting - January 2024</a>
            </li>
            <li>
              <a href="">Latest Intraday leverages - MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;