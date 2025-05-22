import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage"; // Your Landing Page
import ComparisonPage from "./pages/Comparisonpage"; // Comparison Page
import TimelinePage from "./pages/Timeline"; // Timeline Page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Routes>
    </Router>
  );
};

export default App;
