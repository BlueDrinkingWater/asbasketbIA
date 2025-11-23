import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavBar';
import GameTicker from './components/GameTicker';
import Footer from './components/Footer';
import Home from './pages/Home';
import StatsHome from './pages/StatsHome';
import Players from './pages/Players';
import Standings from './pages/Standings';
import Subscribe from './pages/Subscribe';
import AdminDashboard from './pages/AdminDashboard';
import SubscriberDashboard from './pages/Subscriber/SubscriberDashboard';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import OfficialConsole from './pages/OfficialConsole'; // Make sure this file exists
import LiveGame from './pages/LiveGame'; // New public page

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
      
      <div className="sticky top-0 z-50">
        <Navbar />
        <GameTicker />
      </div>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<StatsHome />} />
          <Route path="/players" element={<Players />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/login" element={<Login />} />

          {/* PUBLIC LIVE GAME ROUTE (Timer/Scoreboard) */}
          <Route path="/game/:id" element={<LiveGame />} />

          {/* PROTECTED ROUTES */}
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

          {/* OFFICIAL CONSOLE ROUTE */}
          <Route path="/game/:id/console" element={
            <ProtectedRoute role="user">
              <OfficialConsole />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;