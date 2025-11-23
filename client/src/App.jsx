import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Players from './pages/Players';
import Standings from './pages/Standings';
import AddStats from './pages/AddStats';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Players />} />
        <Route path="/players" element={<Players />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/add-stats" element={<AddStats />} />
      </Routes>
    </div>
  );
}

export default App;