import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Activity, Clock, Trophy, AlertTriangle, Calendar, PlayCircle, Newspaper } from 'lucide-react';
import { fetchGames, fetchPlayers, fetchTeams, fetchNews, fetchSettings } from '../services/api';

const Home = () => {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]); 
  const [mvpCandidates, setMvpCandidates] = useState([]);
  const [standings, setStandings] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // FIX: Wrapped in individual try-catches silently if one fails to prevent full page crash
        const [gamesRes, playersRes, teamsRes, newsRes, settingsRes] = await Promise.all([
          fetchGames().catch(e => ({ data: { data: [] } })),
          fetchPlayers().catch(e => ({ data: { data: [] } })),
          fetchTeams().catch(e => ({ data: { data: [] } })),
          fetchNews().catch(e => ({ data: { data: [] } })),
          fetchSettings().catch(e => ({ data: { data: {} } }))
        ]);

        // 1. Filter out broken games
        const validGames = (gamesRes.data.data || []).filter(g => g.homeTeam && g.awayTeam);

        // 2. Process Featured Game (Priority: Live -> Upcoming -> Recent Final)
        const liveGame = validGames.find(g => g.status === 'live');
        
        const sortedUpcoming = validGames
          .filter(g => g.status === 'scheduled' && new Date(g.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const nextGame = sortedUpcoming[0];
        
        const lastGame = validGames
          .filter(g => g.status === 'Final')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        setFeaturedGame(liveGame || nextGame || lastGame);

        // 3. Set Upcoming Schedule
        const featuredId = (liveGame || nextGame || lastGame)?._id;
        setUpcomingSchedule(sortedUpcoming.filter(g => g._id !== featuredId).slice(0, 4));

        // 4. Process MVP Race
        setMvpCandidates((playersRes.data.data || []).slice(0, 3));

        // 5. Process Standings
        setStandings((teamsRes.data.data || []).slice(0, 5));

        // 6. News & Settings
        setNewsList((newsRes.data.data || []).slice(0, 3)); 
        setSettings(settingsRes.data.data || {});

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
              <Activity className="w-3 h-3 mr-2" /> {settings.seasonName || 'Season 2024-25'}
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              RISE TO <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">GLORY</span>
            </h1>
            <p className="text-lg text-indigo-200 max-w-lg">
              The official hub for the AsBasketBIA league. Real-time scores, advanced player analytics, and league standings.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {/* LIVE LINK BUTTON */}
              {settings.liveStreamUrl ? (
                  <a href={settings.liveStreamUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg shadow-red-900/20 flex items-center animate-pulse">
                    <PlayCircle className="ml-2 w-5 h-5 mr-2" /> WATCH LIVE
                  </a>
              ) : (
                  <Link to="/stats" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-lg shadow-orange-900/20 flex items-center">
                    Player Stats <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
              )}
              
              <Link to="/schedule" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition flex items-center backdrop-blur-sm">
                Full Schedule
              </Link>
            </div>
          </div>
          
          {/* Featured Game Card */}
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
                      <div className="text-center flex-1">
                          <img 
                            src={featuredGame.homeTeam?.logoUrl} 
                            alt={featuredGame.homeTeam?.name} 
                            className="w-16 h-16 mx-auto mb-2 object-contain" 
                            onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Home&background=random'}
                          />
                          <h3 className="font-bold text-lg leading-tight">{featuredGame.homeTeam?.name || "Unknown"}</h3>
                          <p className="text-xs text-gray-400">{featuredGame.homeTeam?.wins || 0}-{featuredGame.homeTeam?.losses || 0}</p>
                      </div>
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
                      <div className="text-center flex-1">
                          <img 
                            src={featuredGame.awayTeam?.logoUrl} 
                            alt={featuredGame.awayTeam?.name} 
                            className="w-16 h-16 mx-auto mb-2 object-contain" 
                            onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Away&background=random'}
                          />
                          <h3 className="font-bold text-lg leading-tight">{featuredGame.awayTeam?.name || "Unknown"}</h3>
                          <p className="text-xs text-gray-400">{featuredGame.awayTeam?.wins || 0}-{featuredGame.awayTeam?.losses || 0}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. LATEST NEWS (NEW SECTION) */}
          <div className="lg:col-span-2">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Newspaper className="w-6 h-6 text-indigo-600 mr-2"/> Latest News
              </h2>
              <Link to="/news" className="text-indigo-600 text-sm font-bold hover:underline">View All News</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsList.length > 0 ? (
                    newsList.map(article => (
                        <div key={article._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer group">
                            <div className="h-48 overflow-hidden">
                                {/* FIX: Replaced via.placeholder.com with ui-avatars.com */}
                                <img 
                                  src={article.imageUrl || 'https://ui-avatars.com/api/?name=News&background=random&size=800'} 
                                  alt="" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{article.category}</span>
                                    <span className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{article.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-3">{article.summary}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 bg-white p-8 rounded-xl text-center text-gray-500 border border-dashed">
                        No news published yet.
                    </div>
                )}
            </div>
          </div>

          {/* 2. SIDEBAR (Upcoming & Standings) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* UPCOMING */}
            <div>
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 text-orange-600 mr-2"/> Upcoming
                </h2>
                <Link to="/schedule" className="text-indigo-600 text-xs font-bold hover:underline">Schedule</Link>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {upcomingSchedule.length > 0 ? (
                    upcomingSchedule.map((game) => (
                    <Link to={`/game/${game._id}`} key={game._id} className="block p-4 border-b border-gray-50 hover:bg-gray-50 transition">
                        <div className="text-xs text-gray-400 mb-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1"/> {new Date(game.date).toLocaleDateString()}
                        </div>
                        <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{game.homeTeam?.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">VS</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{game.awayTeam?.name}</span>
                        </div>
                        </div>
                    </Link>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">No upcoming games.</div>
                )}
                </div>
            </div>

            {/* STANDINGS */}
            <div>
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2"/> Standings
                </h2>
                <Link to="/standings" className="text-indigo-600 text-xs font-bold hover:underline">Full Table</Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-7">Team</div>
                    <div className="col-span-3 text-right">Rec</div>
                </div>
                {standings.length > 0 ? (
                    standings.map((team, index) => (
                    <div key={team._id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 items-center hover:bg-indigo-50/30 transition">
                        <div className="col-span-2 font-mono font-bold text-gray-400 text-xs">#{index + 1}</div>
                        <div className="col-span-7 flex items-center gap-2">
                        <span className="font-bold text-gray-900 truncate text-xs">{team.name}</span>
                        </div>
                        <div className="col-span-3 text-right font-mono text-xs font-medium">
                        {team.wins}-{team.losses}
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">No teams registered.</div>
                )}
                </div>
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