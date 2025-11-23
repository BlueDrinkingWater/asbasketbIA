import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Activity, PlusCircle, LayoutGrid } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-orange-700 text-white" : "text-gray-300 hover:bg-orange-800 hover:text-white";

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-orange-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-orange-500 font-bold text-2xl tracking-tighter">HOOPSTATS</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/players" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/players')}`}>
                <LayoutGrid className="w-4 h-4" /> Players
              </Link>
              <Link to="/standings" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/standings')}`}>
                <Trophy className="w-4 h-4" /> Standings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/add-stats" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
                <PlusCircle className="w-4 h-4" /> Add Stats
             </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;