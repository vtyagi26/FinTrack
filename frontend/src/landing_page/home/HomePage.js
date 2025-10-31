import React from "react";
import Hero from "./Hero";
import Awards from "./Awards";
import Navbar from "../Navbar";
import Stats from "./Stats";
import Pricing from "./Pricing";
import Education from "./Education";
import OpenAccount from "../OpenAccount";
import Footer from "../Footer";

function HomePage() {
  return (
    <>
      <Awards />
      <Stats />
      <Education />
      <Hero />
    </>
  );
}

export default HomePage;