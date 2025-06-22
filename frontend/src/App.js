import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Seller from './pages/Seller';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';         <Route path="/admin-dashboard" element={<Dashboard />} />


function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2px' }}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
