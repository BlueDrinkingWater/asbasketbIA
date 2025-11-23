import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Users, Trophy, Activity, Plus, Send, PlayCircle } from 'lucide-react';

const SubscriberDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); 
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
  const [games, setGames] = useState([]); 
  
  // Form States
  const [statForm, setStatForm] = useState({ playerName: '', ppg: '', rpg: '', apg: '', spg: '', bpg: '' });
  const [teamForm, setTeamForm] = useState({ teamName: '', conference: 'East', roster: [{ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }] });
  const [gameRegForm, setGameRegForm] = useState({ gameId: '', teamName: '', roster: [{ name: '', jerseyNumber: '', position: 'PG' }] });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch all games to allow selecting one for officiating
        const { data } = await api.get('/games'); 
        if(data.success) setGames(data.data);
      } catch (err) {
        console.error("Could not fetch games");
      }
    };
    fetchGames();
  }, []);

  // ... (Handlers: handleStatSubmit, handleTeamSubmit, handleGameRegSubmit remain the same as previous code)
  const handleStatSubmit = async (e) => { e.preventDefault(); try { await api.post('/auth/submit-stats', { userId: userInfo._id, ...statForm }); toast.success('Stats submitted!'); } catch (error) { toast.error('Failed'); } };
  const addTeamPlayerRow = () => { setTeamForm(prev => ({ ...prev, roster: [...prev.roster, { name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }] })); };
  const handleTeamSubmit = async (e) => { e.preventDefault(); try { await api.post('/auth/submit-team', { userId: userInfo._id, ...teamForm }); toast.success('Team submitted!'); } catch (error) { toast.error('Failed'); } };
  const addGamePlayerRow = () => { setGameRegForm(prev => ({ ...prev, roster: [...prev.roster, { name: '', jerseyNumber: '', position: 'PG' }] })); };
  const handleGameRegSubmit = async (e) => { e.preventDefault(); if (!gameRegForm.gameId) return toast.error("Select game"); try { await api.post('/auth/submit-game', { userId: userInfo._id, ...gameRegForm }); toast.success('Registration submitted!'); } catch (error) { toast.error('Failed'); } };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscriber Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Welcome, {userInfo.name}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button onClick={() => setActiveTab('stats')} className={`${activeTab === 'stats' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <Activity className="w-4 h-4 mr-2" /> Add Stats
          </button>
          <button onClick={() => setActiveTab('team')} className={`${activeTab === 'team' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <Users className="w-4 h-4 mr-2" /> Register Team
          </button>
          <button onClick={() => setActiveTab('game')} className={`${activeTab === 'game' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <Trophy className="w-4 h-4 mr-2" /> Game Sign-up
          </button>
          {/* NEW TAB FOR OFFICIALS */}
          <button onClick={() => setActiveTab('official')} className={`${activeTab === 'official' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <PlayCircle className="w-4 h-4 mr-2" /> Official Zone
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        
        {/* 1. STATS FORM */}
        {activeTab === 'stats' && (
           <form onSubmit={handleStatSubmit} className="space-y-6 max-w-lg">
             {/* ... (Input fields from previous code) ... */}
             <p className="text-gray-500">Use this form to submit player statistics for verification.</p>
             <input className="border p-2 w-full rounded" placeholder="Player Name" value={statForm.playerName} onChange={e => setStatForm({...statForm, playerName: e.target.value})} required />
             <button className="bg-orange-600 text-white px-4 py-2 rounded">Submit</button>
           </form>
        )}

        {/* 2. TEAM FORM */}
        {activeTab === 'team' && (
           <form onSubmit={handleTeamSubmit} className="space-y-6">
              {/* ... (Inputs from previous code) ... */}
              <p className="text-gray-500">Register your team for the upcoming season.</p>
              <input className="border p-2 w-full rounded" placeholder="Team Name" value={teamForm.teamName} onChange={e => setTeamForm({...teamForm, teamName: e.target.value})} required />
              <button className="bg-orange-600 text-white px-4 py-2 rounded">Submit Application</button>
           </form>
        )}

        {/* 3. GAME SIGNUP */}
        {activeTab === 'game' && (
          <form onSubmit={handleGameRegSubmit} className="space-y-6">
            <h3 className="text-lg font-medium">Register for a Game</h3>
            <select className="w-full border p-2 rounded" onChange={e => setGameRegForm({...gameRegForm, gameId: e.target.value})}>
                <option value="">Select a game</option>
                {games.map(g => (
                    // FIXED: Safe access to names
                    <option key={g._id} value={g._id}>
                        {new Date(g.date).toLocaleDateString()} - {g.homeTeam?.name || 'TBD'} vs {g.awayTeam?.name || 'TBD'}
                    </option>
                ))}
            </select>
            <button className="bg-orange-600 text-white px-4 py-2 rounded">Sign Up</button>
          </form>
        )}

        {/* 4. NEW OFFICIAL CONSOLE ACCESS */}
        {activeTab === 'official' && (
            <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Warning: You are entering the <strong>Official Scorer's Area</strong>. Only authorized officials should proceed.
                            </p>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900">Select Game to Officiate</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    {games.map(g => (
                        <div key={g._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${g.status === 'live' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {g.status.toUpperCase()}
                                </span>
                                <div className="mt-2 font-bold text-lg">
                                    {g.homeTeam?.name || 'Home'} <span className="text-gray-400">vs</span> {g.awayTeam?.name || 'Away'}
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                    {new Date(g.date).toLocaleString()} @ {g.location}
                                </div>
                            </div>
                            <Link 
                                to={`/game/${g._id}/console`}
                                className="block w-full text-center bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 font-bold"
                            >
                                {g.status === 'live' ? 'Resume Session' : 'Start Game Console'}
                            </Link>
                        </div>
                    ))}
                    {games.length === 0 && <p className="text-gray-500">No games scheduled.</p>}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriberDashboard;