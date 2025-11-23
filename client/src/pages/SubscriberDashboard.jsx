import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Assuming this is your axios instance
import toast from 'react-hot-toast';
import { User, Users, Trophy, Activity, Plus, Send } from 'lucide-react';

const SubscriberDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); // stats, team, game
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')) || {});
  const [games, setGames] = useState([]); // For dropdown
  
  // -- Form States --
  // 1. Player Stats
  const [statForm, setStatForm] = useState({
    playerName: '',
    ppg: '', rpg: '', apg: '', spg: '', bpg: ''
  });

  // 2. Team Registration
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    conference: 'East',
    roster: [{ name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }]
  });

  // 3. Game Registration
  const [gameRegForm, setGameRegForm] = useState({
    gameId: '',
    teamName: '',
    roster: [{ name: '', jerseyNumber: '', position: 'PG' }]
  });

  // Fetch available games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Assuming you have a route to get scheduled games
        const { data } = await api.get('/games?status=scheduled'); 
        if(data.success) setGames(data.data);
      } catch (err) {
        console.error("Could not fetch games");
      }
    };
    fetchGames();
  }, []);

  // --- HANDLERS ---

  // Stats Handler
  const handleStatSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/submit-stats', { userId: userInfo._id, ...statForm });
      toast.success('Stats submitted for Admin approval!');
      setStatForm({ playerName: '', ppg: '', rpg: '', apg: '', spg: '', bpg: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  // Team Handler
  const addTeamPlayerRow = () => {
    setTeamForm(prev => ({
      ...prev,
      roster: [...prev.roster, { name: '', gender: 'Male', jerseyNumber: '', position: 'PG' }]
    }));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/submit-team', { userId: userInfo._id, ...teamForm });
      toast.success('Team Application submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  // Game Registration Handler
  const addGamePlayerRow = () => {
    setGameRegForm(prev => ({
      ...prev,
      roster: [...prev.roster, { name: '', jerseyNumber: '', position: 'PG' }]
    }));
  };

  const handleGameRegSubmit = async (e) => {
    e.preventDefault();
    if (!gameRegForm.gameId) return toast.error("Please select a game");
    try {
      await api.post('/auth/submit-game', { userId: userInfo._id, ...gameRegForm });
      toast.success('Game registration submitted for approval!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Subscriber Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team, stats, and game registrations. All actions require Admin approval.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`${activeTab === 'stats' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Activity className="w-4 h-4 mr-2" /> Add Player Stats
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`${activeTab === 'team' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Users className="w-4 h-4 mr-2" /> Register Team
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`${activeTab === 'game' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Trophy className="w-4 h-4 mr-2" /> Game Sign-up
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white shadow rounded-lg p-6">
        
        {/* 1. ADD STATS TAB */}
        {activeTab === 'stats' && (
          <form onSubmit={handleStatSubmit} className="space-y-6 max-w-lg">
            <h3 className="text-lg font-medium text-gray-900">Submit Player Statistics</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Player Name</label>
              <input 
                type="text" required placeholder="e.g. LeBron James"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={statForm.playerName}
                onChange={(e) => setStatForm({...statForm, playerName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['ppg', 'rpg', 'apg', 'spg', 'bpg'].map((stat) => (
                <div key={stat}>
                  <label className="block text-sm font-medium text-gray-700 uppercase">{stat}</label>
                  <input 
                    type="number" step="0.1" min="0" required placeholder="0.0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={statForm[stat]}
                    onChange={(e) => setStatForm({...statForm, [stat]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
              Submit Stats for Approval
            </button>
          </form>
        )}

        {/* 2. REGISTER TEAM TAB */}
        {activeTab === 'team' && (
          <form onSubmit={handleTeamSubmit} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Register New Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <input 
                  type="text" required placeholder="e.g. Golden State Warriors"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conference</label>
                <select 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={teamForm.conference}
                  onChange={(e) => setTeamForm({...teamForm, conference: e.target.value})}
                >
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Roster</label>
              {teamForm.roster.map((player, index) => (
                <div key={index} className="flex flex-wrap gap-2 mb-2 items-end border-b pb-2 border-gray-100">
                  <input 
                    placeholder="Player Name" required
                    className="flex-1 min-w-[150px] border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.name}
                    onChange={(e) => {
                      const newRoster = [...teamForm.roster];
                      newRoster[index].name = e.target.value;
                      setTeamForm({...teamForm, roster: newRoster});
                    }}
                  />
                  <input 
                    placeholder="#" required type="number"
                    className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.jerseyNumber}
                    onChange={(e) => {
                      const newRoster = [...teamForm.roster];
                      newRoster[index].jerseyNumber = e.target.value;
                      setTeamForm({...teamForm, roster: newRoster});
                    }}
                  />
                  <select 
                    className="w-24 border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.position}
                    onChange={(e) => {
                      const newRoster = [...teamForm.roster];
                      newRoster[index].position = e.target.value;
                      setTeamForm({...teamForm, roster: newRoster});
                    }}
                  >
                    {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ))}
              <button type="button" onClick={addTeamPlayerRow} className="mt-2 text-sm text-orange-600 hover:text-orange-500 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Player
              </button>
            </div>

            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
              Submit Team Application
            </button>
          </form>
        )}

        {/* 3. GAME SIGNUP TAB */}
        {activeTab === 'game' && (
          <form onSubmit={handleGameRegSubmit} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Register for an Upcoming Game</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Game</label>
              <select 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={gameRegForm.gameId}
                onChange={(e) => setGameRegForm({...gameRegForm, gameId: e.target.value})}
                required
              >
                <option value="">-- Choose a scheduled game --</option>
                {games.length > 0 ? games.map(g => (
                  <option key={g._id} value={g._id}>
                    {new Date(g.date).toLocaleDateString()} - {g.homeTeam} vs {g.awayTeam} @ {g.location}
                  </option>
                )) : <option disabled>No scheduled games available</option>}
              </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Your Team Name</label>
                <input 
                  type="text" required placeholder="Team representing"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={gameRegForm.teamName}
                  onChange={(e) => setGameRegForm({...gameRegForm, teamName: e.target.value})}
                />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Participating Roster</label>
              {gameRegForm.roster.map((player, index) => (
                <div key={index} className="flex flex-wrap gap-2 mb-2 items-end border-b pb-2 border-gray-100">
                  <input 
                    placeholder="Player Name" required
                    className="flex-1 min-w-[150px] border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.name}
                    onChange={(e) => {
                      const newRoster = [...gameRegForm.roster];
                      newRoster[index].name = e.target.value;
                      setGameRegForm({...gameRegForm, roster: newRoster});
                    }}
                  />
                  <input 
                    placeholder="#" required type="number"
                    className="w-16 border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.jerseyNumber}
                    onChange={(e) => {
                      const newRoster = [...gameRegForm.roster];
                      newRoster[index].jerseyNumber = e.target.value;
                      setGameRegForm({...gameRegForm, roster: newRoster});
                    }}
                  />
                  <select 
                    className="w-24 border border-gray-300 rounded-md py-1 px-2 text-sm"
                    value={player.position}
                    onChange={(e) => {
                      const newRoster = [...gameRegForm.roster];
                      newRoster[index].position = e.target.value;
                      setGameRegForm({...gameRegForm, roster: newRoster});
                    }}
                  >
                    {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ))}
              <button type="button" onClick={addGamePlayerRow} className="mt-2 text-sm text-orange-600 hover:text-orange-500 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Another Player
              </button>
            </div>

            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
              <Send className="w-4 h-4 mr-2" /> Submit Registration
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default SubscriberDashboard;