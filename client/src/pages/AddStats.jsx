import React, { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { createPlayer } from '../services/api';

const AddStats = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [formData, setFormData] = useState({
    name: '', team: '', position: 'PG', ppg: '', rpg: '', apg: '', imageUrl: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPlayer(formData);
      setStatus({ type: 'success', message: 'Player stats added successfully!' });
      setFormData({ name: '', team: '', position: 'PG', ppg: '', rpg: '', apg: '', imageUrl: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add stats' });
    }
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-600 mb-8">Subscribe to HoopStats Premium to contribute player statistics and manage league data.</p>
          <button 
            onClick={() => setIsSubscribed(true)}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Subscribe for $9.99/mo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-900 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Add Player Stats</h2>
          <p className="text-gray-400">Enter official player statistics</p>
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
              <label className="text-sm font-medium text-gray-700">Player Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. LeBron James" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Team</label>
              <input required name="team" value={formData.team} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Lakers" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Position</label>
              <select name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input required name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">PPG</label>
              <input required type="number" step="0.1" name="ppg" value={formData.ppg} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0.0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">RPG</label>
              <input required type="number" step="0.1" name="rpg" value={formData.rpg} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0.0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">APG</label>
              <input required type="number" step="0.1" name="apg" value={formData.apg} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0.0" />
            </div>
          </div>

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors shadow-md">
            Publish Stats
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStats;