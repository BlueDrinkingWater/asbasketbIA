import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Hook to detect route changes

  // Re-check local storage whenever the route changes (e.g. post-login)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    setUser(storedUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-orange-500 uppercase italic">
              AS<span className="text-white">BASKET</span>BIA
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link to="/schedule" className="hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Schedule</Link>
                <Link to="/stats" className="hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Stats</Link>
                <Link to="/players" className="hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Players</Link>
                <Link to="/standings" className="hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium">Standings</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {!user ? (
                <Link to="/login" className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-sm font-medium">
                  Login / Subscribe
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="flex items-center text-gray-300 hover:text-white">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    {user.role === 'admin' ? "Admin" : "Dashboard"}
                  </Link>
                  
                  <button onClick={handleLogout} className="flex items-center text-gray-300 hover:text-white">
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link to="/schedule" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Schedule</Link>
            <Link to="/stats" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Stats</Link>
            <Link to="/players" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Players</Link>
            {user && (
              <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="text-orange-400 hover:text-orange-300 block px-3 py-2 rounded-md text-base font-medium">
                {user.role === 'admin' ? "Admin Dashboard" : "My Dashboard"}
              </Link>
            )}
            {!user ? (
              <Link to="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Login</Link>
            ) : (
              <button onClick={handleLogout} className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;