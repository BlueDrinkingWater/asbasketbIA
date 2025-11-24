import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Activity, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { fetchGames, fetchPlayers, fetchTeams } from '../services/api';

const Home = () => {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [mvpCandidates, setMvpCandidates] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gamesRes, playersRes, teamsRes] = await Promise.all([
          fetchGames(),
          fetchPlayers(),
          fetchTeams()
        ]);

        // 1. Filter out broken games (where team data is missing/deleted)
        const validGames = gamesRes.data.data.filter(g => g.homeTeam && g.awayTeam);

        // 2. Process Featured Game (Priority: Live -> Upcoming -> Recent Final)
        const liveGame = validGames.find(g => g.status === 'live');
        // Find the closest upcoming game
        const nextGame = validGames
          .filter(g => g.status === 'scheduled' && new Date(g.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        
        // Find the most recent finished game
        const lastGame = validGames
          .filter(g => g.status === 'Final')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        setFeaturedGame(liveGame || nextGame || lastGame);

        // 3. Process MVP Race (Top 3 scorers)
        setMvpCandidates(playersRes.data.data.slice(0, 3));

        // 4. Process Standings (Top 5 Teams)
        setStandings(teamsRes.data.data.slice(0, 5));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO SECTION */}
      <div className="relative bg-indigo-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-indigo-900/90 to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-40" 
            src="https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1920&q=80" 
            alt="Court" 
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Text Content */}
          <div className="md:w-1/2 text-white space-y-6 py-12 md:py-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold tracking-widest border border-orange-500/30 uppercase">
              <Activity className="w-3 h-3 mr-2" /> Season 2024-25
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              RISE TO <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">GLORY</span>
            </h1>
            
            <p className="text-lg text-indigo-200 max-w-lg">
              The official hub for the AsBasketBIA league. Real-time scores, advanced player analytics, and league standings.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/stats" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-lg shadow-orange-900/20 flex items-center">
                Player Stats <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/schedule" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition flex items-center backdrop-blur-sm">
                Schedule
              </Link>
            </div>
          </div>
          
          {/* Dynamic Hero Card: Featured Game */}
          <div className="md:w-1/2 w-full max-w-md">
             {featuredGame ? (
               <div className="relative bg-gray-900/80 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                     <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${featuredGame.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {featuredGame.status === 'live' ? 'LIVE NOW' : featuredGame.status === 'Final' ? 'FINAL SCORE' : 'UPCOMING'}
                        </span>
                     </div>
                     <span className="text-xs font-mono text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1"/> {new Date(featuredGame.date).toLocaleDateString()}
                     </span>
                  </div>

                  <div className="flex justify-between items-center text-white">
                      {/* Home Team */}
                      <div className="text-center flex-1">
                          {/* SAFE NAVIGATION ADDED HERE */}
                          <img 
                            src={featuredGame.homeTeam?.logoUrl || "https://ui-avatars.com/api/?name=Home&background=random"} 
                            alt={featuredGame.homeTeam?.name || "Home"} 
                            className="w-16 h-16 mx-auto mb-2 object-contain" 
                            onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=??&background=random'} // Fallback if image fails
                          />
                          <h3 className="font-bold text-lg leading-tight">{featuredGame.homeTeam?.name || "Unknown"}</h3>
                          <p className="text-xs text-gray-400">
                            {featuredGame.homeTeam?.wins || 0}-{featuredGame.homeTeam?.losses || 0}
                          </p>
                      </div>

                      {/* Score / VS */}
                      <div className="px-4 text-center">
                          {featuredGame.status === 'scheduled' ? (
                             <div className="text-2xl font-black text-gray-500 italic">VS</div>
                          ) : (
                             <div className="flex flex-col items-center">
                               <span className="text-4xl font-mono font-black tracking-tighter">
                                 {featuredGame.homeScore} - {featuredGame.awayScore}
                               </span>
                             </div>
                          )}
                      </div>

                      {/* Away Team */}
                      <div className="text-center flex-1">
                          {/* SAFE NAVIGATION ADDED HERE */}
                          <img 
                            src={featuredGame.awayTeam?.logoUrl || "https://ui-avatars.com/api/?name=Away&background=random"} 
                            alt={featuredGame.awayTeam?.name || "Away"} 
                            className="w-16 h-16 mx-auto mb-2 object-contain" 
                            onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=??&background=random'}
                          />
                          <h3 className="font-bold text-lg leading-tight">{featuredGame.awayTeam?.name || "Unknown"}</h3>
                          <p className="text-xs text-gray-400">
                            {featuredGame.awayTeam?.wins || 0}-{featuredGame.awayTeam?.losses || 0}
                          </p>
                      </div>
                  </div>

                  <Link to={`/game/${featuredGame._id}`} className="mt-8 w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition flex justify-center items-center">
                     Open Gamecast <Activity className="ml-2 w-4 h-4"/>
                  </Link>
               </div>
             ) : (
               <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-12 text-center text-white border border-white/10">
                 <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4"/>
                 <h3 className="text-xl font-bold mb-2">No Games Scheduled</h3>
                 <p className="text-gray-400">Check back later for upcoming matchups.</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT COL: MVP RACE */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2 fill-current"/> Scoring Leaders
              </h2>
              <Link to="/players" className="text-indigo-600 text-sm font-bold hover:underline">View All</Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {mvpCandidates.length > 0 ? (
                mvpCandidates.map((player, index) => (
                  <div key={player._id} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xl font-bold text-gray-300 w-6">#{index + 1}</span>
                      <img 
                        src={player.imageUrl} 
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                        alt={player.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover:border-indigo-500 transition" 
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">{player.name}</h4>
                        {/* Use optional chaining here just in case */}
                        <p className="text-xs text-gray-500">{typeof player.team === 'object' ? player.team?.name : player.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-gray-900">{player.ppg?.toFixed(1) || "0.0"}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PPG</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No player stats available yet.</div>
              )}
            </div>
          </div>

          {/* RIGHT COL: STANDINGS */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-6 h-6 text-orange-500 mr-2"/> League Standings
              </h2>
              <Link to="/standings" className="text-indigo-600 text-sm font-bold hover:underline">Full Table</Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Team</div>
                <div className="col-span-2 text-center">W-L</div>
                <div className="col-span-2 text-center">PCT</div>
              </div>

              {/* Rows */}
              {standings.length > 0 ? (
                standings.map((team, index) => (
                  <div key={team._id} className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-gray-50 items-center hover:bg-indigo-50/30 transition">
                    <div className="col-span-1 font-mono font-bold text-gray-400">{index + 1}</div>
                    <div className="col-span-7 flex items-center gap-3">
                      <img 
                        src={team.logoUrl || `https://ui-avatars.com/api/?name=${team.name}&background=random`} 
                        alt="" 
                        className="w-6 h-6 object-contain" 
                        onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${team.name}&background=random`}
                      />
                      <span className="font-bold text-gray-900">{team.name}</span>
                    </div>
                    <div className="col-span-2 text-center font-mono text-sm font-medium">
                      {team.wins}-{team.losses}
                    </div>
                    <div className="col-span-2 text-center font-mono text-sm text-gray-500">
                      {team.winPercentage || ".000"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No teams registered.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="bg-gray-900 border-t border-gray-800 py-12">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">Join the League</h2>
            <p className="text-gray-400 mb-6">Create your team, manage your roster, and compete for the championship.</p>
            <Link to="/subscribe" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold transition">
               Register Team
            </Link>
         </div>
      </div>
    </div>
  );
};

export default Home;