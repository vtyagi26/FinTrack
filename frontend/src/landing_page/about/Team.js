import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5 border-top">
        <h1 className="text-center">People</h1>
      </div>

      <div
        className="row p-3 text-muted d-flex align-items-center"
        style={{ lineHeight: "1.8", fontSize: "1.1em" }}
      >
        <div className="col-12 col-md-6 p-3 text-center">
          <img
            src="media/images/prasad.png"
            alt="Prasad Waster"
            className="img-fluid"
            style={{
              borderRadius: "50%",
              maxWidth: "200px",
              height: "auto",
            }}
          />
          <h4 className="mt-4 mb-1">Prasad Waster</h4>
          <h6 className="text-secondary">Full Stack Web Developer</h6>
        </div>

        {/* Bio */}
        <div className="col-12 col-md-6 p-3 mt-4 mt-md-0">
          <p>
            I'm Prasad Waster, a full-stack developer currently building
            <strong> InvestaFlow</strong> — a modern trading platform to help
            traders make informed decisions with ease.
          </p>
          <p>
            I specialize in React, Node.js, and cloud-based technologies, and
            I'm passionate about creating seamless user experiences and scalable
            applications.
          </p>
          <p>
            Beyond coding, I love exploring AI, data analytics, and how
            technology can transform the future of finance.
          </p>
          <p>
            Connect with me on{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              Homepage
            </a>{" "}
            /{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>{" "}
            /{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;