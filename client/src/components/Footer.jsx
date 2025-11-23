import React from 'react';
import { Trophy, Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 font-bold text-xl tracking-wider text-white mb-4">
              <Trophy className="h-6 w-6 text-orange-500" />
              <span>HOOP<span className="text-orange-500">STATS</span></span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              The official statistics platform for the amateur basketball league. 
              Tracking legends, one stat at a time.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-white transition"><Facebook className="w-5 h-5"/></a>
              <a href="#" className="hover:text-white transition"><Twitter className="w-5 h-5"/></a>
              <a href="#" className="hover:text-white transition"><Instagram className="w-5 h-5"/></a>
              <a href="#" className="hover:text-white transition"><Youtube className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">League</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/standings" className="hover:text-orange-500 transition">Standings</Link></li>
              <li><Link to="/players" className="hover:text-orange-500 transition">Players</Link></li>
              <li><Link to="/schedule" className="hover:text-orange-500 transition">Schedule</Link></li>
              <li><Link to="/stats" className="hover:text-orange-500 transition">League Leaders</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/subscribe" className="hover:text-orange-500 transition">Join the League</Link></li>
              <li><a href="#" className="hover:text-orange-500 transition">Rule Book</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Media Kit</a></li>
              <li><Link to="/login" className="hover:text-orange-500 transition">Admin Login</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-xs text-gray-500 mb-3">Get the latest highlights and stat breakdowns.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-gray-800 border-none text-white text-sm rounded-l-md w-full py-2 px-3 focus:ring-1 focus:ring-orange-500" />
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 rounded-r-md transition">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} HoopStats League. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;