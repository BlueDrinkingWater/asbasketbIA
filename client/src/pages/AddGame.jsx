import React, { useState, useEffect } from 'react';
import { fetchStandings, createGame } from '../services/api';
import { CheckCircle, AlertTriangle, Swords } from 'lucide-react';

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

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const { data } = await fetchStandings();
        setTeams(data.data);
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
    if (formData.homeTeam === formData.awayTeam) {
      setStatus({ type: 'error', message: 'Home and Away teams cannot be the same' });
      return;
    }

    try {
      await createGame(formData);
      setStatus({ type: 'success', message: 'Game scheduled successfully!' });
      setFormData({ ...formData, homeScore: 0, awayScore: 0, location: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to create game' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-orange-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Swords className="w-6 h-6" /> Schedule Game
          </h2>
          <p className="text-orange-100">Add upcoming matches or record final results</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status.message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Home Team</label>
              <select required name="homeTeam" value={formData.homeTeam} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="">Select Team</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Away Team</label>
              <select required name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="">Select Team</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Madison Square Garden" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Game Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
              <option value="Scheduled">Scheduled</option>
              <option value="Live">Live</option>
              <option value="Final">Final</option>
            </select>
          </div>

          {formData.status === 'Final' && (
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Home Score</label>
                <input required type="number" name="homeScore" value={formData.homeScore} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Away Score</label>
                <input required type="number" name="awayScore" value={formData.awayScore} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors shadow-md">
            Save Game Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGame;