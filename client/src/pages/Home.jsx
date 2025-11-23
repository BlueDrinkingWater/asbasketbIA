import React from 'react';
import { Link } from 'react-router-dom';
// FIXED: Added 'Clock' to the import list
import { ArrowRight, Star, Calendar, TrendingUp, PlayCircle, Clock } from 'lucide-react';

const Home = () => {
  // Mock News Data (In a real app, this would come from an API)
  const news = [
    {
      id: 1,
      title: "Playoffs Picture: Who's In, Who's Out?",
      category: "Analysis",
      time: "2 hours ago",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
      description: "With only three games left in the regular season, the race for the final seed heats up."
    },
    {
      id: 2,
      title: "Rookie Sensation Breaks Single-Game Scoring Record",
      category: "Highlights",
      time: "5 hours ago",
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80",
      description: "A historic night at the downtown arena as records fall."
    },
    {
      id: 3,
      title: "Defensive Player of the Year Ladder: Week 12",
      category: "Awards",
      time: "1 day ago",
      image: "https://images.unsplash.com/photo-1519861531473-920026393131?auto=format&fit=crop&w=800&q=80",
      description: "The block leaders are dominating the paint this season."
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* HERO SECTION */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay" 
            src="https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1920&q=80" 
            alt="Basketball Court" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/90 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase mb-4 border border-orange-500/30">
              Official League Season 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Witness the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Greatness</span>
            </h1>
            <p className="text-lg text-indigo-200 mb-8 max-w-lg leading-relaxed">
              Track every dunk, assist, and buzzer-beater. The premier platform for advanced basketball analytics and league management.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/stats" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-lg shadow-orange-900/20 flex items-center">
                View Stats Center <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/schedule" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition flex items-center backdrop-blur-sm">
                Full Schedule
              </Link>
            </div>
          </div>
          
          {/* Hero Card Mockup */}
          <div className="md:w-1/2 relative hidden md:block">
             <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
             <div className="relative bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
                   <h3 className="text-white font-bold flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-2"/> MVP Race</h3>
                   <span className="text-xs text-gray-500">Updated Today</span>
                </div>
                {[1,2,3].map(i => (
                   <div key={i} className="flex items-center justify-between py-3 hover:bg-gray-800/50 rounded-lg px-2 transition">
                      <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white mr-3">{i}</div>
                         <div>
                            <p className="text-sm font-bold text-gray-200">Player Name</p>
                            <p className="text-xs text-gray-500">Team {i}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-mono font-bold text-orange-400">32.4 PPG</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* FEATURED NEWS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trending Stories</h2>
            <p className="text-gray-500 mt-1">Latest updates from around the league</p>
          </div>
          <a href="#" className="text-indigo-600 font-bold text-sm hover:text-indigo-800 flex items-center">View All News <ArrowRight className="ml-1 w-4 h-4"/></a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-4 shadow-sm">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-900 uppercase tracking-wide shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                   <div className="flex items-center text-white/80 text-xs font-medium">
                      {/* Use Clock Component Here */}
                      <Clock className="w-3 h-3 mr-1" /> {item.time}
                   </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition leading-tight">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-gray-900 text-white py-16 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Ready to join the league?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Register your team today and get access to advanced stat tracking, automated scheduling, and professional player profiles.</p>
            <Link to="/subscribe" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-indigo-900 bg-yellow-400 hover:bg-yellow-300 md:text-lg transition transform hover:-translate-y-1">
               Register Now
            </Link>
         </div>
      </div>
    </div>
  );
};

export default Home;