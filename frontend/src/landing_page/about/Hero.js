import React from "react";

function Hero() {
  const styles = {
    wrapper: {
      background: "linear-gradient(135deg, #0e0e2c, #1f1f3a)",
      minHeight: "100vh",
      paddingTop: "60px",
      color: "#e0e0e0",
    },
    container: {
      padding: "3rem 1rem",
    },
    heading: {
      color: "#58a6ff",
      fontWeight: "600",
    },
    lead: {
      fontSize: "1.25rem",
      marginTop: "1rem",
      color: "#cccccc",
    },
    paragraph: {
      color: "#cccccc",
      fontSize: "1.1rem",
      lineHeight: "1.8",
      marginBottom: "1.5rem",
    },
    link: {
      color: "#58a6ff",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div className="container" style={styles.container}>
        {/* Heading */}
        <div className="row justify-content-center text-center mb-5">
          <div className="col-lg-10">
            <h1 className="display-5" style={styles.heading}>
              Track. Analyze. Understand.
            </h1>
            <p style={styles.lead}>
              Fin_Track brings clarity to your investments with intelligent tracking
              and visual insights — all in one place.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="row text-start">
          <div className="col-md-6 mb-4">
            <p style={styles.paragraph}>
              Managing a stock portfolio doesn’t need to be overwhelming. Fin_Track
              brings your positions, trades, and performance together into a
              streamlined dashboard.
            </p>
            <p style={styles.paragraph}>
              Stay informed about what matters with clean visuals, trade summaries,
              and detailed breakdowns of your portfolio performance.
            </p>
          </div>
          <div className="col-md-6 mb-4">
            <p style={styles.paragraph}>
              Whether you're casually monitoring investments or reviewing long-term
              trends, Fin_Track keeps you organized with data that works for you.
            </p>
            <p style={styles.paragraph}>
              For thoughtful insights and platform updates, visit our{" "}
              <a href="#" style={styles.link}>
                blog
              </a>{" "}
              to stay in the loop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
