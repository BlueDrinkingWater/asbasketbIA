import React, { useState, useEffect } from 'react';
import { fetchTeams, createGame } from '../services/api'; // Use fetchTeams instead of fetchStandings for raw team list
import { CheckCircle, AlertTriangle, Swords, Calendar, MapPin, Trophy } from 'lucide-react';

const AddGame = () => {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    location: '',
    status: 'Scheduled',
    homeScore: 0,
    awayScore: 0
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const { data } = await fetchTeams(); // Ensuring we get the list of teams
        setTeams(data.data || []);
      } catch (err) {
        console.error("Failed to load teams");
      }
    };
    loadTeams();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Validation
    if (formData.homeTeam === formData.awayTeam) {
      setStatus({ type: 'error', message: 'Home and Away teams cannot be the same.' });
      return;
    }
    if (formData.status === 'Final' && (formData.homeScore < 0 || formData.awayScore < 0)) {
      setStatus({ type: 'error', message: 'Scores cannot be negative.' });
      return;
    }

    setLoading(true);
    try {
      // Map specific status for backend if needed, here we assume backend handles 'Final'/'Scheduled'
      await createGame(formData);
      setStatus({ type: 'success', message: 'Game updated in system successfully!' });
      // Reset only non-sticky fields
      setFormData(prev => ({ 
        ...prev, 
        homeScore: 0, 
        awayScore: 0, 
        homeTeam: '',
        awayTeam: ''
      }));
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create game.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Swords className="w-7 h-7" /> League Scheduler
          </h2>
          <p className="opacity-90 mt-1">Manage upcoming fixtures and record match results</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {status.message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          {/* Status Selector */}
          <div className="flex justify-center pb-6 border-b border-gray-100">
            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
              {['Scheduled', 'Live', 'Final'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({...formData, status: s})}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    formData.status === s 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Match Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Match Info</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date & Time</label>
                <input required type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Arena / Location</label>
                <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Crypto.com Arena" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Teams</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Home Team</label>
                <select required name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                  <option value="">Select Home Team</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Away Team</label>
                <select required name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                  <option value="">Select Away Team</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Scoreboard - Only if Final or Live */}
          {(formData.status === 'Final' || formData.status === 'Live') && (
            <div className="bg-gray-900 p-6 rounded-xl text-white">
              <h3 className="text-center text-orange-500 font-bold mb-4 flex justify-center items-center gap-2">
                <Trophy className="w-4 h-4" /> Scoreboard
              </h3>
              <div className="flex items-center justify-between gap-8">
                <div className="text-center w-1/2">
                  <label className="block text-xs text-gray-400 mb-1">HOME SCORE</label>
                  <input required type="number" name="homeScore" value={formData.homeScore} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-3 text-center text-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <span className="text-2xl font-bold text-gray-600">-</span>
                <div className="text-center w-1/2">
                  <label className="block text-xs text-gray-400 mb-1">AWAY SCORE</label>
                  <input required type="number" name="awayScore" value={formData.awayScore} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-3 text-center text-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold shadow-lg transition-colors">
            {loading ? 'Processing...' : formData.status === 'Final' ? 'Record Final Result' : 'Schedule Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGame;