import React from "react";
import "../Styles/Achievements.css";

function Achievements() {
  return (
    <div className="achievements-container py-5">
      <div className="container">
        <div className="row align-items-center g-4">
          {/* Text Section */}
          <div className="col-12 col-md-6">
            <h2 className="achievements-title mb-3">Empowering Financial Futures</h2>
            <p className="achievements-description">
              FinTrack enables users to track, manage, and analyze their portfolios with precision.
              Our mission is to simplify financial tracking and provide insightful data to help users
              make confident investment decisions.
            </p>
            <ul className="achievement-points">
              <li>Built for retail and active investors</li>
              <li>Live portfolio performance and history</li>
              <li>Detailed trade analytics and summaries</li>
              <li>Optimized for mobile and desktop usage</li>
            </ul>
            <div className="stats-box mt-4">
              <div>
                <h3>&mdash;</h3>
                <p>User Satisfaction</p>
              </div>
              <div>
                <h3>&mdash;</h3>
                <p>Trades Tracked</p>
              </div>
              <div>
                <h3>&mdash;</h3>
                <p>Live Sync Support</p>
              </div>
            </div>
          </div>

          {/* Image Section */}
          {/* Image Section */}
<div className="col-12 col-md-6 text-center d-flex flex-column align-items-center">
  <img
    src="media/images/download.jpg"
    alt="FinTrack Achievements"
    className="img-fluid rounded shadow mb-3"
    style={{ maxWidth: "90%" }}
  />
  <img
    src="media/images/download2.jpg"
    alt="FinTrack Achievements"
    className="img-fluid rounded shadow"
    style={{ maxWidth: "90%" }}
  />
</div>

        </div>
      </div>
    </div>
  );
}

export default Achievements;
