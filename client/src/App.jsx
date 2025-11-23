import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/NavBar';
import Players from './pages/Players';
import Standings from './pages/Standings';
import Subscribe from './pages/Subscribe';
import AdminDashboard from './pages/AdminDashboard';
import SubscriberDashboard from './pages/SubscriberDashboard'; // Import New Page
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
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Players />} />
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

        {/* New Subscriber Dashboard Route */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="user">
            <SubscriberDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;