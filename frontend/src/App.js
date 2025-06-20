import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // adjust path if needed
import Navbar from "./components/Navbar"; // optional, if you have a navbar

function App() {
  return (
    <Router>
      {/* Optional: Navbar */}
      {/* <Navbar /> */}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Later add more routes like UploadListing, SellerAnalytics */}
      </Routes>
    </Router>
  );
}

export default App;
