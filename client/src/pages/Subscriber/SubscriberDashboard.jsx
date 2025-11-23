// client/src/pages/Subscriber/SubscriberDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Users, Trophy, Activity, Plus, PlayCircle, Monitor, Calendar, BarChart3 } from 'lucide-react';
import GameTicker from '../../components/GameTicker';

const SubscriberDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); 
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
  const [games, setGames] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Form States
  const [statForm, setStatForm] = useState({ playerName: '', ppg: '', rpg: '', apg: '', spg: '', bpg: '' });
  const [teamForm, setTeamForm] = useState({ teamName: '', conference: 'East', roster: [{ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }] });
  const [gameRegForm, setGameRegForm] = useState({ gameId: '', teamName: '', roster: [{ name: '', jerseyNumber: '', position: 'PG' }] });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch all games
        const { data } = await api.get('/games'); 
        if(data.success) setGames(data.data);
      } catch (err) {
        console.error("Could not fetch games");
        toast.error("Could not load league data");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Handlers
  const handleStatSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
        await api.post('/auth/submit-stats', { userId: userInfo._id, ...statForm }); 
        toast.success('Stats submitted for review!'); 
        setStatForm({ playerName: '', ppg: '', rpg: '', apg: '', spg: '', bpg: '' }); 
    } catch (error) { 
        toast.error('Failed to submit stats'); 
    } 
  };

  const handleTeamSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
        await api.post('/auth/submit-team', { userId: userInfo._id, ...teamForm }); 
        toast.success('Team application submitted!'); 
        setTeamForm({ teamName: '', conference: 'East', roster: [{ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }] });
    } catch (error) { 
        toast.error('Failed to submit team'); 
    } 
  };

  const handleGameRegSubmit = async (e) => { 
    e.preventDefault(); 
    if (!gameRegForm.gameId) return toast.error("Select game"); 
    try { 
        await api.post('/auth/submit-game', { userId: userInfo._id, ...gameRegForm }); 
        toast.success('Game registration submitted!'); 
        setGameRegForm({ gameId: '', teamName: '', roster: [{ name: '', jerseyNumber: '', position: 'PG' }] }); 
    } catch (error) { 
        toast.error('Failed to register'); 
    } 
  };

  // Tabs configuration for cleaner render
  const tabs = [
    { id: 'stats', label: 'Add Stats', icon: Activity },
    { id: 'team', label: 'Register Team', icon: Users },
    { id: 'game', label: 'Join Game', icon: Calendar },
    { id: 'official', label: 'Official Console', icon: PlayCircle },
    { id: 'live', label: 'Live & Scores', icon: Monitor },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="w-8 h-8 mr-3 text-orange-600" />
                Subscriber Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Welcome back, <span className="font-semibold text-gray-800">{userInfo.name}</span>
            </p>
        </div>
      </div>

      {/* Styled Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6">
        
        {/* 1. STATS SUBMISSION */}
        {activeTab === 'stats' && (
           <div className="max-w-2xl">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Player Statistics</h2>
               <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                   <p className="text-sm text-blue-800">
                       Submit your game performance data here. All stats are subject to validation by league admins before appearing on the public leaderboard.
                   </p>
               </div>
               <form onSubmit={handleStatSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                    <input 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border" 
                        placeholder="Enter full name" 
                        value={statForm.playerName} 
                        onChange={e => setStatForm({...statForm, playerName: e.target.value})} 
                        required 
                    />
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {['ppg', 'rpg', 'apg', 'spg', 'bpg'].map(stat => (
                        <div key={stat}>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{stat.toUpperCase()}</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-2 border"
                                placeholder="0.0"
                                value={statForm[stat]} 
                                onChange={e => setStatForm({...statForm, [stat]: e.target.value})}
                            />
                        </div>
                    ))}
                 </div>
                 <div className="pt-4">
                    <button className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all w-full sm:w-auto">
                        Submit Stats
                    </button>
                 </div>
               </form>
           </div>
        )}

        {/* 2. TEAM REGISTRATION */}
        {activeTab === 'team' && (
           <div className="max-w-2xl">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Team</h2>
               <p className="text-gray-500 mb-6">Start a new franchise in the AsBasketBIA league.</p>
               
               <form onSubmit={handleTeamSubmit} className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                      <input 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border" 
                        placeholder="e.g. Quezon City Wildcats" 
                        value={teamForm.teamName} 
                        onChange={e => setTeamForm({...teamForm, teamName: e.target.value})} 
                        required 
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conference</label>
                      <select 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                        value={teamForm.conference}
                        onChange={e => setTeamForm({...teamForm, conference: e.target.value})}
                      >
                          <option value="East">East Conference</option>
                          <option value="West">West Conference</option>
                      </select>
                  </div>
                  <button className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all w-full">
                    Submit Application
                  </button>
               </form>
           </div>
        )}

        {/* 3. GAME SIGNUP */}
        {activeTab === 'game' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join a Match</h2>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <p className="text-sm text-green-800">
                    View open slots for upcoming games and register your team to play.
                </p>
            </div>
            
            <form onSubmit={handleGameRegSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Upcoming Game</label>
                    <select 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border" 
                        onChange={e => setGameRegForm({...gameRegForm, gameId: e.target.value})}
                    >
                        <option value="">-- Choose a game --</option>
                        {games.filter(g => g.status !== 'Final').map(g => (
                            <option key={g._id} value={g._id}>
                                {new Date(g.date).toLocaleDateString()} | {g.homeTeam?.name || 'TBD'} vs {g.awayTeam?.name || 'TBD'} @ {g.location}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Team Name</label>
                    <input 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border" 
                        placeholder="Enter the team you are representing" 
                        value={gameRegForm.teamName} 
                        onChange={e => setGameRegForm({...gameRegForm, teamName: e.target.value})} 
                        required 
                    />
                </div>
                <button className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all">
                    Register for Game
                </button>
            </form>
          </div>
        )}

        {/* 4. OFFICIAL CONSOLE */}
        {activeTab === 'official' && (
            <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start">
                    <PlayCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-yellow-800">Official Scorer's Zone</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            This console controls the public scoreboard. Only authorized officials should launch the game console.
                        </p>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mt-6">Select Game to Officiate</h3>
                
                {games.length === 0 ? (
                    <p className="text-gray-500 py-8">No scheduled games found.</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {games.map(g => (
                            <div key={g._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white flex flex-col">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {g.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(g.date).toLocaleDateString()}</span>
                                </div>
                                <div className="p-5 flex-grow flex flex-col items-center justify-center">
                                    <div className="font-bold text-lg text-gray-900 text-center">
                                        {g.homeTeam?.name || 'Home'} 
                                        <div className="text-xs text-gray-400 font-normal my-1">VS</div> 
                                        {g.awayTeam?.name || 'Away'}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{g.location}</p>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <Link 
                                        to={`/game/${g._id}/console`}
                                        className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 font-bold text-sm transition-colors"
                                    >
                                        {g.status === 'live' ? 'Resume Console' : 'Start Console'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* 5. LIVE & SCORES ZONE */}
        {activeTab === 'live' && (
            <div className="space-y-8">
                {/* Embedded Game Ticker */}
                <div className="bg-black rounded-xl overflow-hidden shadow-lg p-1">
                    <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-green-500" />
                            Live League Ticker
                        </h3>
                        <span className="text-[10px] text-gray-500">REAL-TIME</span>
                    </div>
                    <div className="relative h-14 bg-gray-900 border-t border-gray-800">
                        <GameTicker />
                    </div>
                </div>

                {/* Scoreboard Links */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Monitor className="w-5 h-5 mr-2 text-gray-600" />
                        Watch Live Scoreboards
                    </h3>
                    
                    {games.length === 0 ? (
                        <p className="text-gray-500">No games found.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {games.map(g => (
                                <div key={g._id} className="group relative border border-gray-200 rounded-xl p-0 overflow-hidden hover:shadow-xl transition-all bg-white">
                                    {/* Status Banner */}
                                    {g.status === 'live' && (
                                        <div className="bg-red-600 text-white text-center text-xs font-bold py-1 animate-pulse">
                                            LIVE NOW
                                        </div>
                                    )}
                                    
                                    <div className="p-6 text-center">
                                        <div className="flex justify-center items-center space-x-4 mb-2">
                                            <div className="text-2xl font-bold text-gray-900">{g.homeScore}</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-widest">vs</div>
                                            <div className="text-2xl font-bold text-gray-900">{g.awayScore}</div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 mb-4">
                                            {g.homeTeam?.name || 'Home'} vs {g.awayTeam?.name || 'Away'}
                                        </div>
                                        <Link 
                                            to={`/game/${g._id}`}
                                            className={`inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
                                                g.status === 'live' 
                                                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {g.status === 'live' ? (
                                                <>
                                                    <Monitor className="w-4 h-4 mr-2" /> Watch Live
                                                </>
                                            ) : 'View Details'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriberDashboard;