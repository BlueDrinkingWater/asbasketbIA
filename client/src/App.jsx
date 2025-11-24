import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavBar';
import GameTicker from './components/GameTicker';
import Footer from './components/Footer';

// --- Existing Pages ---
import Home from './pages/Home';
import StatsHome from './pages/StatsHome';
import Players from './pages/Players';
import Standings from './pages/Standings';
import Subscribe from './pages/Subscribe';
import AdminDashboard from './pages/AdminDashboard';
import SubscriberDashboard from './pages/Subscriber/SubscriberDashboard';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import OfficialConsole from './pages/OfficialConsole';
import LiveGame from './pages/LiveGame';

// --- New Modules (Added) ---
import NewsPage from './pages/NewsPage';
import Tickets from './pages/Tickets';
import TeamDetails from './pages/TeamDetails';
import StatsLeaderboard from './pages/StatsLeaderboard';
import LeagueSettings from './pages/Admin/LeagueSettings';

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
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          
          {/* News & Media Module */}
          <Route path="/news" element={<NewsPage />} />
          
          {/* Ticketing Module */}
          <Route path="/tickets" element={<Tickets />} />

          {/* Stats & Players Module */}
          <Route path="/stats" element={<StatsHome />} />
          <Route path="/stats/leaders" element={<StatsLeaderboard />} />
          <Route path="/players" element={<Players />} />
          
          {/* Teams Module */}
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/standings" element={<Standings />} />
          
          {/* Schedule & Gamecast */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/game/:id" element={<LiveGame />} />

          {/* Auth */}
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED ROUTES --- */}
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute role="admin">
              <LeagueSettings />
            </ProtectedRoute>
          } />

          {/* User/Subscriber Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <SubscriberDashboard />
            </ProtectedRoute>
          } />

          {/* Official Console Route */}
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