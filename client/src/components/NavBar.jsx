import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, User, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-wider">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>HOOP<span className="text-yellow-400">STATS</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/players" className="hover:text-yellow-400 transition">Players</Link>
            <Link to="/standings" className="hover:text-yellow-400 transition">Standings</Link>
            <Link to="/schedule" className="hover:text-yellow-400 transition">Schedule</Link>
            
            {user?.subscriptionStatus === 'active' && (
               <Link to="/pro-stats" className="text-yellow-400 font-semibold">Pro Board</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                    <Shield className="w-4 h-4 mr-1" /> Admin
                  </Link>
                )}
                <span className="text-sm text-gray-300">Hi, {user.name}</span>
                <button onClick={handleLogout} className="p-2 hover:bg-indigo-800 rounded-full">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm hover:text-white text-gray-200">Login</Link>
                <Link to="/subscribe" className="px-4 py-2 bg-yellow-500 text-indigo-900 font-bold rounded hover:bg-yellow-400 transition">
                  Subscribe
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;