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
  fetchGames,
  // News & Content
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  fetchSettings,
  updateSettings,
  // Business Logic
  fetchAllTickets,
  fetchTrades,
  processTrade
} from '../services/api';
import toast from 'react-hot-toast';
import { 
  Check, X, User, Users, Activity, Calendar, 
  Loader, Plus, Settings, Shield, Upload, Trophy, Trash2,
  Monitor, AlertCircle, Ticket, Newspaper, Edit, Video,
  ArrowLeftRight, DollarSign
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
  const [playerForm, setPlayerForm] = useState({ 
    name: '', team: '', position: 'PG', jerseyNumber: '', 
    ppg: 0, rpg: 0, apg: 0, image: null 
  });

  // Tournament State
  const [tourneySettings, setTourneySettings] = useState({ roundName: 'Preliminary', date: '', location: '' });
  const [matchups, setMatchups] = useState([{ id: 1, home: '', away: '' }]);

  // Content Management State
  const [newsList, setNewsList] = useState([]);
  const [newsForm, setNewsForm] = useState({ id: null, title: '', summary: '', content: '', category: 'Announcement', imageUrl: '' });
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [leagueSettings, setLeagueSettings] = useState({ liveStreamUrl: '' });

  // Business & Transaction State
  const [ticketData, setTicketData] = useState({ tickets: [], totalRevenue: 0, totalSold: 0 });
  const [tradeList, setTradeList] = useState([]);

  // --- Data Loading ---
  const loadData = async () => {
    try {
      setLoading(true);
      // Use allSettled or individual catches to prevent one failure from blocking everything
      const [adminRes, teamsRes, gamesRes] = await Promise.all([
        fetchAdminData().catch(e => null),
        fetchTeams().catch(e => null),
        fetchGames().catch(e => null)
      ]);
      
      if(adminRes?.data?.success) setData(adminRes.data.data);
      if(teamsRes?.data?.success) setTeamsList(teamsRes.data.data || []);
      if(gamesRes?.data?.success) setGamesList(gamesRes.data.data || []);
      
      if (!adminRes) toast.error("Could not connect to server.");

    } catch (error) {
      console.error(error);
      toast.error('Failed to sync dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const loadContentData = async () => {
    try {
        const [newsRes, settingsRes] = await Promise.all([
            fetchNews().catch(e => null), 
            fetchSettings().catch(e => null)
        ]);
        if(newsRes?.data?.success) setNewsList(newsRes.data.data);
        if(settingsRes?.data?.success) setLeagueSettings(settingsRes.data.data);
    } catch (error) {
        console.error("Content load error", error);
    }
  }

  const loadBusinessData = async () => {
    try {
        const [ticketsRes, tradesRes] = await Promise.all([
            fetchAllTickets().catch(e => null), 
            fetchTrades().catch(e => null)
        ]);
        if(ticketsRes?.data?.success) setTicketData(ticketsRes.data.data);
        if(tradesRes?.data?.success) setTradeList(tradesRes.data.data);
    } catch (error) {
        console.error("Business data error", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if(activeTab === 'content') loadContentData();
    if(activeTab === 'tickets' || activeTab === 'trades') loadBusinessData();
  }, [activeTab]);

  // --- Core Handlers ---
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

  // --- Content Handlers ---
  const handleSaveNews = async (e) => {
    e.preventDefault();
    if(!newsForm.title || !newsForm.content) return toast.error("Title and Content are required");
    
    try {
        if(isEditingNews && newsForm.id) {
            await updateNews(newsForm.id, newsForm);
            toast.success("News updated!");
        } else {
            await createNews(newsForm);
            toast.success("News published!");
        }
        setNewsForm({ id: null, title: '', summary: '', content: '', category: 'Announcement', imageUrl: '' });
        setIsEditingNews(false);
        loadContentData();
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to save news");
    }
  };

  const handleEditNews = (article) => {
    setNewsForm({ 
      ...article, 
      id: article._id,
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || 'Announcement',
      imageUrl: article.imageUrl || ''
    });
    setIsEditingNews(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNews = async (id) => {
    if(!window.confirm("Are you sure you want to delete this article?")) return;
    try {
        await deleteNews(id);
        toast.success("Article deleted");
        loadContentData();
    } catch (err) {
        toast.error("Failed to delete");
    }
  };

  const handleSaveSettings = async (e) => {
      e.preventDefault();
      try {
          await updateSettings(leagueSettings);
          toast.success("Home page settings updated");
      } catch (err) {
          toast.error("Failed to update settings");
      }
  };

  // --- Trade Handlers ---
  const handleTradeAction = async (tradeId, action) => {
    try {
        await processTrade({ tradeId, action });
        toast.success(`Trade ${action}`);
        loadBusinessData();
    } catch (error) {
        toast.error(error.response?.data?.message || "Action failed");
    }
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

  const tabs = [
    { id: 'users', label: 'Approvals', icon: User, count: (data?.pendingUsers?.length || 0) + (data?.teamRequests?.length || 0) },
    { id: 'stats', label: 'Stats/Games', icon: Activity, count: (data?.statRequests?.length || 0) + (data?.gameRequests?.length || 0) },
    { id: 'manage', label: 'League Data', icon: Settings },
    { id: 'tournament', label: 'Tournament', icon: Trophy },
    { id: 'live', label: 'Live Ops', icon: Monitor },
    { id: 'content', label: 'News & Media', icon: Newspaper }, 
    { id: 'trades', label: 'Transactions', icon: ArrowLeftRight, count: tradeList.filter(t => t.status === 'Pending').length },
    { id: 'tickets', label: 'Ticketing', icon: Ticket },       
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
            <Link to="/admin/settings" className="text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center bg-gray-100 px-3 py-1.5 rounded-full transition-colors">
                <Settings className="w-3 h-3 mr-1" /> League Settings
            </Link>
          </div>
          <div className="text-xs font-medium text-gray-500">
            System Status: {data ? <span className="text-green-600 font-bold">ONLINE</span> : <span className="text-red-600 font-bold">OFFLINE</span>}
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
                {/* FIX: Safe access to pendingUsers */}
                {(!data?.pendingUsers || data.pendingUsers.length === 0) ? (
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
                {/* FIX: Safe access to teamRequests */}
                {(!data?.teamRequests || data.teamRequests.length === 0) ? (
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
                    {data?.statRequests?.map((req) => (
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
                    {data?.gameRequests?.map((req) => (
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
                    {(!data?.statRequests?.length && !data?.gameRequests?.length) && (
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

          {/* 6. NEW: NEWS & CONTENT */}
          {activeTab === 'content' && (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Live Stream Link Management */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Video className="w-5 h-5 mr-2 text-red-500" /> Live Stream Config
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Embed a YouTube or Twitch link to display on the Home Page hero section.</p>
                            <form onSubmit={handleSaveSettings}>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Stream URL</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://youtube.com/watch?v=..." 
                                        className="w-full border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500"
                                        value={leagueSettings.liveStreamUrl || ''}
                                        onChange={(e) => setLeagueSettings({...leagueSettings, liveStreamUrl: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition">
                                    Update Live Link
                                </button>
                            </form>
                        </div>

                        {/* News Editor Form */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                {isEditingNews ? <><Edit className="w-5 h-5 mr-2 text-indigo-500"/> Edit Article</> : <><Plus className="w-5 h-5 mr-2 text-green-500"/> Post News</>}
                            </h3>
                            <form onSubmit={handleSaveNews} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
                                    <input type="text" required className="w-full border-gray-300 rounded-lg p-2 text-sm"
                                        value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                                    <select className="w-full border-gray-300 rounded-lg p-2 text-sm"
                                        value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                                    >
                                        {['Recap', 'Announcement', 'Trade', 'Interview', 'Highlight'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Image URL</label>
                                    <input type="text" placeholder="https://..." className="w-full border-gray-300 rounded-lg p-2 text-sm"
                                        value={newsForm.imageUrl} onChange={e => setNewsForm({...newsForm, imageUrl: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Summary</label>
                                    <input type="text" maxLength="150" placeholder="Short description..." className="w-full border-gray-300 rounded-lg p-2 text-sm"
                                        value={newsForm.summary} onChange={e => setNewsForm({...newsForm, summary: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Content <span className="text-red-500">*</span></label>
                                    <textarea required rows="6" className="w-full border-gray-300 rounded-lg p-2 text-sm"
                                        value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                                        {isEditingNews ? 'Update Article' : 'Publish Article'}
                                    </button>
                                    {isEditingNews && (
                                        <button type="button" onClick={() => { setIsEditingNews(false); setNewsForm({id: null, title: '', summary: '', content: '', category: 'Announcement', imageUrl: ''}); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Recent Posts</h3>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{newsList.length} items</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {newsList.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No news articles found.</div>
                                ) : (
                                    newsList.map(article => (
                                        <div key={article._id} className="p-4 hover:bg-gray-50 transition flex gap-4">
                                            <img 
                                                src={article.imageUrl || 'https://ui-avatars.com/api/?name=News&background=random'} 
                                                alt="" 
                                                className="w-24 h-16 object-cover rounded-lg bg-gray-200"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                            article.category === 'Announcement' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                            article.category === 'Recap' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>{article.category}</span>
                                                        <h4 className="font-bold text-gray-900 mt-1 line-clamp-1">{article.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        <button onClick={() => handleEditNews(article)} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white border border-gray-200 rounded hover:border-indigo-200 transition">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteNews(article._id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded hover:border-red-200 transition">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-2 flex items-center">
                                                    <span>By {article.author}</span>
                                                    <span className="mx-1">•</span>
                                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* 7. NEW: TRADES (TRANSACTIONS) */}
          {activeTab === 'trades' && (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Transaction Wire</h3>
                    <div className="text-sm text-gray-500">Pending: <span className="font-bold text-orange-600">{tradeList.filter(t => t.status === 'Pending').length}</span></div>
                </div>
                <div className="space-y-4">
                    {tradeList.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-xl">No transactions found.</div>
                    ) : (
                        tradeList.map(trade => (
                            <div key={trade._id} className={`border rounded-xl p-6 bg-white ${trade.status === 'Pending' ? 'border-orange-200 shadow-sm' : 'opacity-60'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${trade.status==='Pending'?'bg-orange-100 text-orange-800':trade.status==='Approved'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{trade.status}</span>
                                    <span className="text-xs text-gray-400">{new Date(trade.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="font-black text-lg">{trade.proposingTeam?.name}</div>
                                        <div className="text-xs text-gray-500 uppercase mb-2">Receives</div>
                                        {trade.assetsRequested.map(p => <div key={p._id} className="font-bold text-indigo-600">{p.name}</div>)}
                                    </div>
                                    <div className="px-6 text-gray-300"><ArrowLeftRight /></div>
                                    <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="font-black text-lg">{trade.receivingTeam?.name}</div>
                                        <div className="text-xs text-gray-500 uppercase mb-2">Receives</div>
                                        {trade.assetsOffered.map(p => <div key={p._id} className="font-bold text-indigo-600">{p.name}</div>)}
                                    </div>
                                </div>
                                {trade.status === 'Pending' && (
                                    <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button onClick={()=>handleTradeAction(trade._id, 'Approved')} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700">Approve Trade</button>
                                        <button onClick={()=>handleTradeAction(trade._id, 'Declined')} className="px-4 py-2 border border-red-200 text-red-600 text-sm font-bold rounded hover:bg-red-50">Veto</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
          )}

          {/* 8. NEW: TICKETING DASHBOARD */}
          {activeTab === 'tickets' && (
            <div className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</div>
                        <div className="text-4xl font-black">${ticketData.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tickets Sold</div>
                        <div className="text-4xl font-black text-gray-900">{ticketData.totalSold}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-center">
                         <div className="text-center">
                             <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                             <div className="text-sm font-bold text-gray-500">Box Office Active</div>
                         </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Sales History</h3>
                <div className="bg-white border rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Game</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seat</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ticketData.tickets.map(t => (
                                <tr key={t._id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{t.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-gray-500">{t.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {t.game?.homeTeam?.name} vs {t.game?.awayTeam?.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold">{t.seatNumber}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">${t.price}</td>
                                </tr>
                            ))}
                            {ticketData.tickets.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No tickets sold yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;