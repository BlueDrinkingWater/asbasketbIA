// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchAdminData, 
  updateSubscription, 
  updateTeamRequest, 
  updateStatRequest, 
  updateGameRequest,
  createTeam,
  createPlayer,
  createGame,
  fetchTeams,
  fetchGames 
} from '../services/api';
import toast from 'react-hot-toast';
import { 
  Check, X, User, Users, Activity, Calendar, 
  Loader, Plus, Settings, Shield, Upload, Trophy, Trash2,
  Monitor, AlertCircle, Ticket, Newspaper
} from 'lucide-react';
import GameTicker from '../components/GameTicker';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [teamsList, setTeamsList] = useState([]); 
  const [gamesList, setGamesList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); 

  // Management Forms State
  const [manageTab, setManageTab] = useState('addTeam'); 
  const [teamForm, setTeamForm] = useState({ name: '', conference: 'East', logoUrl: '' });
  const [gameForm, setGameForm] = useState({ homeTeam: '', awayTeam: '', date: '', location: '' });

  // --- DYNAMIC TOURNAMENT STATE ---
  const [tourneySettings, setTourneySettings] = useState({ roundName: 'Preliminary', date: '', location: '' });
  const [matchups, setMatchups] = useState([{ id: 1, home: '', away: '' }]);

  const [playerForm, setPlayerForm] = useState({ 
    name: '', team: '', position: 'PG', jerseyNumber: '', 
    ppg: 0, rpg: 0, apg: 0, image: null 
  });

  // --- Data Loading ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [adminRes, teamsRes, gamesRes] = await Promise.all([
        fetchAdminData(),
        fetchTeams(),
        fetchGames()
      ]);
      
      if(adminRes.data.success) setData(adminRes.data.data);
      if(teamsRes.data.success) setTeamsList(teamsRes.data.data || []);
      if(gamesRes.data.success) setGamesList(gamesRes.data.data || []);
      
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

  // --- Handlers ---
  const handleSubAction = async (userId, status) => {
    try { await updateSubscription({ userId, status }); toast.success(`User ${status === 'active' ? 'approved' : 'rejected'}`); loadData(); } catch (e) { toast.error('Action failed'); }
  };

  const handleTeamAction = async (userId, action) => {
    try { await updateTeamRequest({ userId, action }); toast.success(`Team ${action}d`); loadData(); } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleStatAction = async (userId, reqId, action) => {
    try { await updateStatRequest({ userId, reqId, action }); toast.success(`Stats ${action}d`); loadData(); } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const handleGameAction = async (userId, reqId, action) => {
    try { await updateGameRequest({ userId, reqId, action }); toast.success(`Game registration ${action}d`); loadData(); } catch (e) { toast.error('Action failed'); }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return toast.error("Team name is required");
    try { await createTeam(teamForm); toast.success('Team created successfully!'); setTeamForm({ name: '', conference: 'East', logoUrl: '' }); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to create team'); }
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!gameForm.homeTeam || !gameForm.awayTeam) return toast.error("Select both teams");
    try { await createGame({ ...gameForm, round: 'Regular Season' }); toast.success('Game scheduled successfully!'); setGameForm({ homeTeam: '', awayTeam: '', date: '', location: '' }); loadData(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to schedule game'); }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(playerForm).forEach(key => formData.append(key, playerForm[key]));
    try { await createPlayer(formData); toast.success('Player added successfully!'); setPlayerForm({ name: '', team: '', position: 'PG', jerseyNumber: '', ppg: 0, rpg: 0, apg: 0, image: null }); } catch (err) { toast.error(err.response?.data?.message || 'Failed to add player'); }
  };

  // Tournament Logic
  const addMatchupRow = () => setMatchups([...matchups, { id: Date.now(), home: '', away: '' }]);
  const removeMatchupRow = (id) => { if (matchups.length > 1) setMatchups(matchups.filter(m => m.id !== id)); };
  const updateMatchup = (id, field, value) => setMatchups(matchups.map(m => m.id === id ? { ...m, [field]: value } : m));

  const handleBatchSchedule = async (e) => {
    e.preventDefault();
    const { roundName, date, location } = tourneySettings;
    if (!date || !location || !roundName) return toast.error("All round settings required.");
    
    const validGames = [];
    for (let m of matchups) {
      if (!m.home || !m.away) return toast.error("Incomplete matchups detected.");
      validGames.push({ homeTeam: m.home, awayTeam: m.away, date, location, round: roundName, status: 'scheduled' });
    }

    try {
      await Promise.all(validGames.map(gameData => createGame(gameData)));
      toast.success(`Scheduled ${validGames.length} games!`);
      setMatchups([{ id: Date.now(), home: '', away: '' }]);
      setTourneySettings({ ...tourneySettings, date: '', location: '' });
      loadData();
    } catch (err) { toast.error("Batch schedule failed."); }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen text-gray-800">
      <Loader className="animate-spin w-12 h-12 text-orange-600 mb-4" />
      <p className="font-bold text-lg">Loading Admin Suite...</p>
    </div>
  );

  // Updated Tabs Configuration
  const tabs = [
    { id: 'users', label: 'Approvals', icon: User, count: (data?.pendingUsers?.length || 0) + (data?.teamRequests?.length || 0) },
    { id: 'stats', label: 'Stats/Games', icon: Activity, count: (data?.statRequests?.length || 0) + (data?.gameRequests?.length || 0) },
    { id: 'manage', label: 'League Data', icon: Settings },
    { id: 'tournament', label: 'Tournament', icon: Trophy },
    { id: 'live', label: 'Live Ops', icon: Monitor },
    { id: 'content', label: 'News & Media', icon: Newspaper }, // NEW
    { id: 'tickets', label: 'Ticketing', icon: Ticket },       // NEW
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                <Shield className="w-6 h-6 mr-2 text-orange-600" />
                ADMIN <span className="text-orange-600 ml-1">PORTAL</span>
            </h1>
            {/* NEW: Direct Link to League Settings */}
            <Link to="/admin/settings" className="text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center bg-gray-100 px-3 py-1.5 rounded-full transition-colors">
                <Settings className="w-3 h-3 mr-1" /> League Settings
            </Link>
          </div>
          <div className="text-xs font-medium text-gray-500">
            System Status: <span className="text-green-600 font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 overflow-x-auto border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-red-500 text-white py-0.5 px-2 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          
          {/* 1. APPROVALS (Users & Teams) */}
          {activeTab === 'users' && (
            <div className="p-8 grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center pb-2 border-b">
                  <User className="w-5 h-5 mr-2 text-gray-400" /> Pending Subscriptions
                </h3>
                {data?.pendingUsers?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-sm text-gray-500">No pending subscriptions.</p>
                  </div>
                ) : (
                  data.pendingUsers.map(user => (
                    <div key={user._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.paymentProofUrl && (
                          <a href={user.paymentProofUrl} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                            <Upload className="w-3 h-3 mr-1"/> Receipt
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleSubAction(user._id, 'active')} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check className="w-4 h-4"/></button>
                        <button onClick={() => handleSubAction(user._id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><X className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center pb-2 border-b">
                  <Users className="w-5 h-5 mr-2 text-gray-400" /> Team Applications
                </h3>
                {data?.teamRequests?.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-sm text-gray-500">No team applications.</p>
                  </div>
                ) : (
                  data.teamRequests.map(user => (
                    <div key={user._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">NEW TEAM</span>
                          <h4 className="font-black text-lg mt-1">{user.teamRegistration.teamName}</h4>
                          <p className="text-xs text-gray-500">Captain: {user.name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleTeamAction(user._id, 'approve')} className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800">Accept</button>
                          <button onClick={() => handleTeamAction(user._id, 'reject')} className="px-3 py-1 border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50">Deny</button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                        <strong>Roster Preview:</strong> {user.teamRegistration.roster.map(p => p.name).join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. STATS & GAMES */}
          {activeTab === 'stats' && (
            <div className="p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Pending Validations</h3>
              <div className="bg-white border rounded-lg overflow-hidden mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.statRequests.map((req) => (
                      <tr key={req.reqId}>
                        <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">STAT</span></td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">{req.playerName}</div>
                          <div className="text-gray-500">PTS: {req.stats?.ppg} | REB: {req.stats?.rpg} | AST: {req.stats?.apg}</div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleStatAction(req.userId, req.reqId, 'approve')} className="text-green-600 hover:text-green-900 font-bold text-xs">APPROVE</button>
                          <button onClick={() => handleStatAction(req.userId, req.reqId, 'reject')} className="text-red-600 hover:text-red-900 font-bold text-xs">REJECT</button>
                        </td>
                      </tr>
                    ))}
                    {data?.gameRequests.map((req) => (
                      <tr key={req.reqId}>
                        <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">GAME</span></td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-gray-900">{req.teamName}</div>
                          <div className="text-gray-500">Requesting to join match</div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleGameAction(req.userId, req.reqId, 'approve')} className="text-green-600 hover:text-green-900 font-bold text-xs">APPROVE</button>
                          <button onClick={() => handleGameAction(req.userId, req.reqId, 'reject')} className="text-red-600 hover:text-red-900 font-bold text-xs">REJECT</button>
                        </td>
                      </tr>
                    ))}
                    {data?.statRequests.length === 0 && data?.gameRequests.length === 0 && (
                      <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-sm">No pending validations found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. LEAGUE DATA (Create Forms) */}
          {activeTab === 'manage' && (
            <div className="flex flex-col md:flex-row h-full min-h-[600px]">
              <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6">
                 <nav className="space-y-2">
                   {['addTeam', 'addPlayer', 'addGame'].map((tab) => (
                     <button
                       key={tab} 
                       onClick={() => setManageTab(tab)}
                       className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${manageTab === tab ? 'bg-white text-orange-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
                     >
                        {tab === 'addTeam' && <><Shield className="w-4 h-4 inline mr-2"/> New Team</>}
                        {tab === 'addPlayer' && <><User className="w-4 h-4 inline mr-2"/> New Player</>}
                        {tab === 'addGame' && <><Calendar className="w-4 h-4 inline mr-2"/> Single Game</>}
                     </button>
                   ))}
                 </nav>
              </div>

              <div className="flex-1 p-8">
                {manageTab === 'addTeam' && (
                  <form onSubmit={handleCreateTeam} className="max-w-lg">
                     <h3 className="text-xl font-bold text-gray-900 mb-6">Create Franchise</h3>
                     <div className="space-y-5">
                        <input type="text" required placeholder="Team Name" className="w-full border-gray-300 rounded-lg p-3 focus:ring-orange-500 focus:border-orange-500" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                        <select className="w-full border-gray-300 rounded-lg p-3 focus:ring-orange-500" value={teamForm.conference} onChange={e => setTeamForm({...teamForm, conference: e.target.value})}>
                           <option value="East">East Conference</option>
                           <option value="West">West Conference</option>
                        </select>
                        <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Create Team</button>
                     </div>
                  </form>
                )}
                {manageTab === 'addGame' && (
                  <form onSubmit={handleCreateGame} className="max-w-lg">
                     <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Match</h3>
                     <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <select required className="border-gray-300 rounded-lg p-3" value={gameForm.homeTeam} onChange={e => setGameForm({...gameForm, homeTeam: e.target.value})}>
                              <option value="">Home Team</option>
                              {Array.isArray(teamsList) && teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                           </select>
                           <select required className="border-gray-300 rounded-lg p-3" value={gameForm.awayTeam} onChange={e => setGameForm({...gameForm, awayTeam: e.target.value})}>
                              <option value="">Away Team</option>
                              {Array.isArray(teamsList) && teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                           </select>
                        </div>
                        <input type="datetime-local" required className="w-full border-gray-300 rounded-lg p-3" value={gameForm.date} onChange={e => setGameForm({...gameForm, date: e.target.value})} />
                        <input type="text" required placeholder="Arena Location" className="w-full border-gray-300 rounded-lg p-3" value={gameForm.location} onChange={e => setGameForm({...gameForm, location: e.target.value})} />
                        <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Schedule Game</button>
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
                                {Array.isArray(teamsList) && teamsList.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
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
                              <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                 onChange={e => setPlayerForm({...playerForm, image: e.target.files[0]})}
                              />
                           </div>
                        </div>

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

          {/* 4. TOURNAMENT BATCH */}
          {activeTab === 'tournament' && (
            <div className="p-8">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" /> Batch Scheduler
                </h2>
                <form onSubmit={handleBatchSchedule}>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <input type="text" placeholder="Round Name (e.g. Finals)" className="border-gray-300 rounded p-2 text-sm" value={tourneySettings.roundName} onChange={e => setTourneySettings({...tourneySettings, roundName: e.target.value})} />
                    <input type="datetime-local" className="border-gray-300 rounded p-2 text-sm" value={tourneySettings.date} onChange={e => setTourneySettings({...tourneySettings, date: e.target.value})} />
                    <input type="text" placeholder="Location" className="border-gray-300 rounded p-2 text-sm" value={tourneySettings.location} onChange={e => setTourneySettings({...tourneySettings, location: e.target.value})} />
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {matchups.map((m, idx) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4">{idx+1}</span>
                        <select className="flex-1 border-gray-300 rounded text-sm p-2" value={m.home} onChange={e => updateMatchup(m.id, 'home', e.target.value)}>
                          <option value="">Home</option>
                          {Array.isArray(teamsList) && teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <span className="text-gray-300 font-bold text-xs">VS</span>
                        <select className="flex-1 border-gray-300 rounded text-sm p-2" value={m.away} onChange={e => updateMatchup(m.id, 'away', e.target.value)}>
                          <option value="">Away</option>
                          {Array.isArray(teamsList) && teamsList.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <button type="button" onClick={() => removeMatchupRow(m.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={addMatchupRow} className="text-sm font-bold text-orange-600 hover:underline">+ Add Game</button>
                    <button className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm">Generate Schedule</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 5. LIVE OPERATIONS */}
          {activeTab === 'live' && (
            <div className="flex flex-col h-full">
              <div className="bg-black p-2">
                <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest px-2">Live Feed Monitor</div>
                <GameTicker />
              </div>

              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Game Control Center</h3>
                    <p className="text-sm text-gray-500">Manage live scores, clocks, and official data streams.</p>
                  </div>
                </div>

                {gamesList.length === 0 ? (
                   <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                      <AlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-gray-500">No games scheduled.</p>
                   </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {gamesList.map(g => (
                      <div key={g._id} className={`border rounded-xl overflow-hidden transition-all ${g.status === 'live' ? 'border-red-200 shadow-red-100 shadow-lg ring-1 ring-red-100' : 'border-gray-200'}`}>
                        <div className={`px-6 py-4 flex justify-between items-center ${g.status === 'live' ? 'bg-red-50' : 'bg-gray-50'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${g.status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                            {g.status}
                          </span>
                          <span className="text-xs font-medium text-gray-500">{new Date(g.date).toLocaleDateString()}</span>
                        </div>
                        <div className="p-6 bg-white">
                          <div className="flex justify-between items-center mb-6">
                            <div className="text-center w-1/3">
                              <div className="font-black text-2xl text-gray-900">{g.homeScore || 0}</div>
                              <div className="text-sm font-bold text-gray-600 truncate">{g.homeTeam?.name || 'Home'}</div>
                            </div>
                            <div className="text-xs font-bold text-gray-300 uppercase">VS</div>
                            <div className="text-center w-1/3">
                              <div className="font-black text-2xl text-gray-900">{g.awayScore || 0}</div>
                              <div className="text-sm font-bold text-gray-600 truncate">{g.awayTeam?.name || 'Away'}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Link to={`/game/${g._id}/console`} className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition">
                              <Settings className="w-4 h-4 mr-2" /> Official Console
                            </Link>
                            <Link to={`/game/${g._id}`} className="flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition">
                              <Monitor className="w-4 h-4 mr-2" /> View Board
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. NEW: NEWS & CONTENT (Placeholder for missing module) */}
          {activeTab === 'content' && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <Newspaper className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">News & Content Management</h3>
                <p className="text-gray-500 mb-6 max-w-md">Manage league announcements, press releases, and media content appearing on the public news page.</p>
                <Link to="/news" className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition">
                    View Live News Page
                </Link>
            </div>
          )}

          {/* 7. NEW: TICKETING (Placeholder for missing module) */}
          {activeTab === 'tickets' && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <Ticket className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Ticketing & Sales</h3>
                <p className="text-gray-500 mb-6 max-w-md">Manage ticket inventory, view sales reports, and configure seating charts for league games.</p>
                <Link to="/tickets" className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition">
                    Open Ticketing Portal
                </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;