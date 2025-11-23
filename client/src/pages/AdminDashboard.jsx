// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  fetchAdminData, 
  updateSubscription, 
  updateTeamRequest, 
  updateStatRequest, 
  updateGameRequest,
  createTeam,
  createPlayer,
  createGame,
  fetchTeams
} from '../services/api';
import toast from 'react-hot-toast';
import { 
  Check, X, User, Users, Activity, Calendar, 
  Loader, Plus, Settings, Shield, Upload, Trophy, Trash2 
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [teamsList, setTeamsList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); 

  // Management Forms State
  const [manageTab, setManageTab] = useState('addTeam'); 
  const [teamForm, setTeamForm] = useState({ name: '', conference: 'East', logoUrl: '' });
  
  const [gameForm, setGameForm] = useState({ 
    homeTeam: '', awayTeam: '', date: '', location: '' 
  });

  // --- DYNAMIC TOURNAMENT STATE ---
  const [tourneySettings, setTourneySettings] = useState({
    roundName: 'Preliminary', // Default round name
    date: '',
    location: ''
  });
  // Start with 1 empty matchup row
  const [matchups, setMatchups] = useState([{ id: 1, home: '', away: '' }]);

  const [playerForm, setPlayerForm] = useState({ 
    name: '', team: '', position: 'PG', jerseyNumber: '', 
    ppg: 0, rpg: 0, apg: 0, image: null 
  });

  // --- Data Loading ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [adminRes, teamsRes] = await Promise.all([
        fetchAdminData(),
        fetchTeams()
      ]);
      
      if(adminRes.data.success) setData(adminRes.data.data);
      if(teamsRes.data.success) setTeamsList(teamsRes.data.data);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers for Dashboard Actions ---
  const handleSubAction = async (userId, status) => {
    try {
      await updateSubscription({ userId, status });
      toast.success(`User ${status === 'active' ? 'approved' : 'rejected'}`);
      loadData();
    } catch (e) { toast.error('Action failed'); }
  };

  const handleTeamAction = async (userId, action) => {
    try {
      await updateTeamRequest({ userId, action });
      toast.success(`Team ${action}d`);
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleStatAction = async (userId, reqId, action) => {
    try {
      await updateStatRequest({ userId, reqId, action });
      toast.success(`Stats ${action}d`);
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleGameAction = async (userId, reqId, action) => {
    try {
      await updateGameRequest({ userId, reqId, action });
      toast.success(`Game registration ${action}d`);
      loadData();
    } catch (e) { toast.error('Action failed'); }
  };

  // --- Single Creation Handlers ---
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return toast.error("Team name is required");
    try {
      await createTeam(teamForm);
      toast.success('Team created successfully!');
      setTeamForm({ name: '', conference: 'East', logoUrl: '' });
      loadData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!gameForm.homeTeam || !gameForm.awayTeam) return toast.error("Select both teams");
    if (gameForm.homeTeam === gameForm.awayTeam) return toast.error("Teams must be different");
    
    try {
      await createGame({ ...gameForm, round: 'Regular Season' });
      toast.success('Game scheduled successfully!');
      setGameForm({ homeTeam: '', awayTeam: '', date: '', location: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule game');
    }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(playerForm).forEach(key => formData.append(key, playerForm[key]));

    try {
      await createPlayer(formData);
      toast.success('Player added successfully!');
      setPlayerForm({ name: '', team: '', position: 'PG', jerseyNumber: '', ppg: 0, rpg: 0, apg: 0, image: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add player');
    }
  };

  // --- Tournament Batch Logic ---
  
  // Add a new empty row
  const addMatchupRow = () => {
    setMatchups([...matchups, { id: Date.now(), home: '', away: '' }]);
  };

  // Remove a row
  const removeMatchupRow = (id) => {
    if (matchups.length === 1) return; // Keep at least one
    setMatchups(matchups.filter(m => m.id !== id));
  };

  // Update specific row data
  const updateMatchup = (id, field, value) => {
    setMatchups(matchups.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Validate and Submit Batch
  const handleBatchSchedule = async (e) => {
    e.preventDefault();
    const { roundName, date, location } = tourneySettings;

    // 1. Basic Validation
    if (!date || !location) return toast.error("Please set Date and Location for this round.");
    if (!roundName) return toast.error("Please name this round (e.g. Semi-Finals).");

    // 2. Check Matchups
    const usedTeams = new Set();
    const validGames = [];

    for (let m of matchups) {
      // Skip empty rows if user left them blank, or alert? Let's alert.
      if (!m.home || !m.away) return toast.error("All added matchup rows must have teams selected.");
      if (m.home === m.away) return toast.error("A team cannot play against itself.");
      
      // Check for duplicates in the batch
      if (usedTeams.has(m.home) || usedTeams.has(m.away)) {
        return toast.error("A team is selected more than once in this batch.");
      }
      usedTeams.add(m.home);
      usedTeams.add(m.away);

      validGames.push({
        homeTeam: m.home,
        awayTeam: m.away,
        date,
        location,
        round: roundName,
        status: 'scheduled'
      });
    }

    // 3. Submit All
    try {
      const promises = validGames.map(gameData => createGame(gameData));
      await Promise.all(promises);
      toast.success(`Successfully scheduled ${validGames.length} games for ${roundName}!`);
      
      // Reset
      setMatchups([{ id: Date.now(), home: '', away: '' }]);
      setTourneySettings({ ...tourneySettings, date: '', location: '' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create batch schedule.");
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen text-indigo-900">
      <Loader className="animate-spin w-10 h-10 mb-4" />
      <p className="font-semibold">Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-orange-600" />
          Admin Dashboard
        </h1>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200 overflow-x-auto pb-2">
        {[
          { id: 'users', label: 'Subscriptions', icon: User, count: data?.pendingUsers?.length },
          { id: 'teams', label: 'Team Requests', icon: Users, count: data?.teamRequests?.length },
          { id: 'stats', label: 'Stat Updates', icon: Activity, count: data?.statRequests?.length },
          { id: 'games', label: 'Game Signups', icon: Calendar, count: data?.gameRequests?.length },
          { id: 'manage', label: 'Manage League', icon: Settings, count: 0 },
          { id: 'tournament', label: 'Tournament Batch', icon: Trophy, count: 0 },
        ].map(tab => (
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
            {tab.count > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
        
        {/* 1. SUBSCRIPTIONS */}
        {activeTab === 'users' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Pending Subscriptions</h2>
            {data?.pendingUsers?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Check className="mx-auto h-12 w-12 text-green-400 mb-3" />
                <p className="text-gray-500">All subscriptions handled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.pendingUsers.map(user => (
                  <div key={user._id} className="border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center bg-gray-50 hover:bg-white transition-colors shadow-sm">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.paymentProofUrl && (
                        <a href={user.paymentProofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center">
                          <Upload className="w-3 h-3 mr-1" /> View Proof
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => handleSubAction(user._id, 'rejected')} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm">Reject</button>
                      <button onClick={() => handleSubAction(user._id, 'active')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. TEAM REQUESTS */}
        {activeTab === 'teams' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Team Applications</h2>
            {data?.teamRequests?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No pending team applications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {data.teamRequests.map(user => (
                  <div key={user._id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{user.teamRegistration.teamName}</h3>
                        <p className="text-sm text-gray-500">Captain: {user.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleTeamAction(user._id, 'reject')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><X /></button>
                        <button onClick={() => handleTeamAction(user._id, 'approve')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><Check /></button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Roster</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {user.teamRegistration.roster.map((p, i) => (
                          <div key={i} className="text-sm text-gray-700">{p.jerseyNumber} - {p.name} ({p.position})</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. STAT UPDATES */}
        {activeTab === 'stats' && (
          <div className="p-6">
             <h2 className="text-xl font-bold mb-4 text-gray-800">Stat Updates</h2>
             {data?.statRequests?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Activity className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No pending updates.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stats</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.statRequests.map((req) => (
                    <tr key={req.reqId}>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.userName}</td>
                      <td className="px-6 py-4 text-sm font-bold">{req.playerName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="mr-2">PTS: {req.stats?.ppg}</span>
                        <span className="mr-2">REB: {req.stats?.rpg}</span>
                        <span>AST: {req.stats?.apg}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleStatAction(req.userId, req.reqId, 'approve')} className="text-green-600 hover:underline">Approve</button>
                        <button onClick={() => handleStatAction(req.userId, req.reqId, 'reject')} className="text-red-600 hover:underline">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. GAME REQUESTS */}
        {activeTab === 'games' && (
           <div className="p-6">
           <h2 className="text-xl font-bold mb-4 text-gray-800">Game Signups</h2>
           {data?.gameRequests?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
               <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
               <p className="text-gray-500">No pending registrations.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {data.gameRequests.map(req => (
                <div key={req.reqId} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-white">
                  <div>
                    <p className="font-bold">{req.teamName}</p>
                    <p className="text-sm text-gray-500">Requested by: {req.userName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleGameAction(req.userId, req.reqId, 'approve')} className="text-green-600">Approve</button>
                    <button onClick={() => handleGameAction(req.userId, req.reqId, 'reject')} className="text-red-600">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* 5. TOURNAMENT BATCH SCHEDULER (UPDATED) */}
        {activeTab === 'tournament' && (
          <div className="p-8">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <Trophy className="text-orange-600 w-6 h-6 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Tournament Batch Scheduler</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Schedule multiple games at once for a specific round (Preliminary, Semi-Finals, Finals, etc.).
              </p>

              <form onSubmit={handleBatchSchedule}>
                
                {/* 1. Round Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Round Name</label>
                    <input 
                      type="text" 
                      list="round-suggestions"
                      placeholder="e.g. Semi-Finals" 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                      value={tourneySettings.roundName}
                      onChange={e => setTourneySettings({...tourneySettings, roundName: e.target.value})}
                    />
                    <datalist id="round-suggestions">
                      <option value="Preliminary" />
                      <option value="Quarter-Finals" />
                      <option value="Semi-Finals" />
                      <option value="Finals" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      required 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                      value={tourneySettings.date} 
                      onChange={e => setTourneySettings({...tourneySettings, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Arena Name" 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm"
                      value={tourneySettings.location} 
                      onChange={e => setTourneySettings({...tourneySettings, location: e.target.value})}
                    />
                  </div>
                </div>

                {/* 2. Matchups Builder */}
                <div className="space-y-3 mb-6">
                  {matchups.map((matchup, index) => (
                    <div key={matchup.id} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200">
                      <div className="text-sm font-bold text-gray-400 w-6">#{index + 1}</div>
                      
                      <div className="flex-1">
                        <select 
                          className="w-full border-gray-300 rounded text-sm"
                          value={matchup.home}
                          onChange={e => updateMatchup(matchup.id, 'home', e.target.value)}
                        >
                          <option value="">Select Home Team</option>
                          {teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                      </div>

                      <div className="font-bold text-gray-300 text-xs">VS</div>

                      <div className="flex-1">
                        <select 
                          className="w-full border-gray-300 rounded text-sm"
                          value={matchup.away}
                          onChange={e => updateMatchup(matchup.id, 'away', e.target.value)}
                        >
                          <option value="">Select Away Team</option>
                          {teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => removeMatchupRow(matchup.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        disabled={matchups.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button 
                    type="button" 
                    onClick={addMatchupRow}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Matchup
                  </button>

                  <button 
                    type="submit" 
                    className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all"
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Schedule {matchups.length} Games
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* 6. MANAGE TAB (Creation Forms) */}
        {activeTab === 'manage' && (
          <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
               <div className="space-y-2">
                 <button 
                   onClick={() => setManageTab('addTeam')} 
                   className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${manageTab === 'addTeam' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:bg-gray-100'}`}
                 >
                    <Shield className="w-4 h-4 inline mr-2"/> Create Team
                 </button>
                 <button 
                   onClick={() => setManageTab('addPlayer')} 
                   className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${manageTab === 'addPlayer' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:bg-gray-100'}`}
                 >
                    <User className="w-4 h-4 inline mr-2"/> Add Player
                 </button>
                 <button 
                   onClick={() => setManageTab('addGame')} 
                   className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${manageTab === 'addGame' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:bg-gray-100'}`}
                 >
                    <Calendar className="w-4 h-4 inline mr-2"/> Single Game
                 </button>
               </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-8">
              {manageTab === 'addTeam' && (
                <form onSubmit={handleCreateTeam} className="max-w-lg">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Team</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                         <input type="text" required placeholder="e.g. Lakers" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                           value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Conference</label>
                         <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                            value={teamForm.conference} onChange={e => setTeamForm({...teamForm, conference: e.target.value})}
                         >
                           <option value="East">East</option>
                           <option value="West">West</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                         <input type="text" placeholder="https://..." className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                           value={teamForm.logoUrl} onChange={e => setTeamForm({...teamForm, logoUrl: e.target.value})}
                         />
                      </div>
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4">
                         <Plus className="w-4 h-4 mr-2" /> Create Team
                      </button>
                   </div>
                </form>
              )}

              {manageTab === 'addGame' && (
                <form onSubmit={handleCreateGame} className="max-w-lg">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Single Game</h3>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Home Team</label>
                            <select required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                               value={gameForm.homeTeam} onChange={e => setGameForm({...gameForm, homeTeam: e.target.value})}
                            >
                              <option value="">Select Team</option>
                              {teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Away Team</label>
                            <select required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                               value={gameForm.awayTeam} onChange={e => setGameForm({...gameForm, awayTeam: e.target.value})}
                            >
                              <option value="">Select Team</option>
                              {teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                         <input type="datetime-local" required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                           value={gameForm.date} onChange={e => setGameForm({...gameForm, date: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                         <input type="text" required placeholder="e.g. Staples Center" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                           value={gameForm.location} onChange={e => setGameForm({...gameForm, location: e.target.value})}
                         />
                      </div>
                      <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4">
                         <Calendar className="w-4 h-4 mr-2" /> Schedule Game
                      </button>
                   </div>
                </form>
              )}

              {manageTab === 'addPlayer' && (
                <form onSubmit={handleCreatePlayer} className="max-w-2xl">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Player</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                           <input type="text" required placeholder="Full Name" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                             value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})}
                           />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                            <select required className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                               value={playerForm.team} onChange={e => setPlayerForm({...playerForm, team: e.target.value})}
                            >
                              <option value="">Select Team</option>
                              {teamsList.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                            </select>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                               <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                                  value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})}
                               >
                                 {['PG', 'SG', 'SF', 'PF', 'C'].map(p => <option key={p} value={p}>{p}</option>)}
                               </select>
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Jersey #</label>
                               <input type="number" required placeholder="0" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 py-2 px-3 border"
                                 value={playerForm.jerseyNumber} onChange={e => setPlayerForm({...playerForm, jerseyNumber: e.target.value})}
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                            <input type="file" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                               onChange={e => setPlayerForm({...playerForm, image: e.target.files[0]})}
                            />
                         </div>
                      </div>

                      {/* Initial Stats Section */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Initial Stats (Optional)</h4>
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                               <label className="text-sm text-gray-600">Points (PPG)</label>
                               <input type="number" step="0.1" className="w-20 border-gray-300 rounded py-1 px-2 border" 
                                  value={playerForm.ppg} onChange={e => setPlayerForm({...playerForm, ppg: e.target.value})}
                               />
                            </div>
                            <div className="flex justify-between items-center">
                               <label className="text-sm text-gray-600">Rebounds (RPG)</label>
                               <input type="number" step="0.1" className="w-20 border-gray-300 rounded py-1 px-2 border" 
                                  value={playerForm.rpg} onChange={e => setPlayerForm({...playerForm, rpg: e.target.value})}
                               />
                            </div>
                            <div className="flex justify-between items-center">
                               <label className="text-sm text-gray-600">Assists (APG)</label>
                               <input type="number" step="0.1" className="w-20 border-gray-300 rounded py-1 px-2 border" 
                                  value={playerForm.apg} onChange={e => setPlayerForm({...playerForm, apg: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6">
                      <Plus className="w-4 h-4 mr-2" /> Add Player to Roster
                   </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;