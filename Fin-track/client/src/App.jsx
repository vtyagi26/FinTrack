import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
import MainLayout from "./layouts/mainlayout";
import Dashboard from "./pages/Dashboard";

import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  // Initialize AOS only once
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration
      once: true,     // only animate once
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Hero />
              <Features />
              <Stats />
            </MainLayout>
          }
        />
        <Route
          path="/signin"
          element={
            <MainLayout>
              <SignIn />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout>
              <SignUp />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/*"
          element={<Dashboard />}
        />
      </Routes>
    </Router>
  );
}

export default App;