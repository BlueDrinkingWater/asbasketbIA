import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavBar';
import GameTicker from './components/GameTicker'; // Import Ticker
import Footer from './components/Footer';         // Import Footer
import Home from './pages/Home';                  // Import New Home
import StatsHome from './pages/StatsHome';
import Players from './pages/Players';
import Standings from './pages/Standings';
import Subscribe from './pages/Subscribe';
import AdminDashboard from './pages/AdminDashboard';
import SubscriberDashboard from './pages/SubscriberDashboard'; 
import Schedule from './pages/Schedule'; 
import Login from './pages/Login';

// Helper for protected routes
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="sticky top-0 z-50">
        <Navbar />
        <GameTicker />
      </div>

      {/* Main Content (Flex grow to push footer down if content is short) */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<StatsHome />} />
          <Route path="/players" element={<Players />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/schedule" element={<Schedule />} />
          
          {/* Auth Routes */}
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <SubscriberDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;