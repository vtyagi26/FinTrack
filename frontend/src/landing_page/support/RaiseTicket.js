import React from "react";

const topics = [
  {
    title: "Account Opening",
    items: [
      "Resident individual",
      "Non Resident Indian (NRI)",
      "Minor",
      "Company, Partnership, HUF and LLP",
      "Glossary",
    ],
  },
  {
    title: "Your InvestaFlow Account",
    items: [
      "Online Account Opening",
      "Offline Account Opening",
      "Company, Partnership and HUF Account",
      "Opening",
      "NRI Account Opening",
      "Charges at InvestaFlow",
      "InvestaFlow IDFC FIRST Bank 3-in-1 Account",
      "Getting Started",
    ],
  },
  {
    title: "Kite",
    items: [
      "Online Account Opening",
      "Offline Account Opening",
      "Company, Partnership and HUF Account",
      "Opening",
      "NRI Account Opening",
      "Charges at InvestaFlow",
      "InvestaFlow IDFC FIRST Bank 3-in-1 Account",
      "Getting Started",
    ],
  },
  {
    title: "Funds",
    items: [
      "Online Account Opening",
      "Offline Account Opening",
      "Company, Partnership and HUF Account",
      "Opening",
      "NRI Account Opening",
      "Charges at InvestaFlow",
      "InvestaFlow IDFC FIRST Bank 3-in-1 Account",
      "Getting Started",
    ],
  },
  {
    title: "Console",
    items: [
      "Online Account Opening",
      "Offline Account Opening",
      "Company, Partnership and HUF Account",
      "Opening",
      "NRI Account Opening",
      "Charges at InvestaFlow",
      "InvestaFlow IDFC FIRST Bank 3-in-1 Account",
      "Getting Started",
    ],
  },
  {
    title: "Coin",
    items: [
      "Online Account Opening",
      "Offline Account Opening",
      "Company, Partnership and HUF Account",
      "Opening",
      "NRI Account Opening",
      "Charges at InvestaFlow",
      "InvestaFlow IDFC FIRST Bank 3-in-1 Account",
      "Getting Started",
    ],
  },
];

function RaiseTicket() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5">
        <h1 className="fs-2 text-muted">
          To create a ticket, select a relevant topic
        </h1>

        {topics.map((topic, index) => (
          <div className="col-12 col-md-4 p-4" key={index}>
            <a
              style={{
                fontSize: "18px",
                color: "#222222",
                textDecoration: "none",
              }}
              href="#"
            >
              <i className="fa fa-plus-circle me-2" aria-hidden="true"></i>
              {topic.title}
            </a>
            <div className="mt-3">
              {topic.items.map((item, i) => (
                <div key={i}>
                  <a
                    href="#"
                    style={{ textDecoration: "none", lineHeight: "2.5" }}
                  >
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RaiseTicket;