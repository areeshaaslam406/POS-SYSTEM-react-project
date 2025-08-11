import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PointOfSale from './pages/PointOfSale';
import Products from './pages/Products';
import Salespersons from './pages/Salespersons';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<PointOfSale />} />
          <Route path="/products" element={<Products />} />
          <Route path="/salespersons" element={<Salespersons />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;