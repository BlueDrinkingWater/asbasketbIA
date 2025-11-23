import React, { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, Upload, Activity } from 'lucide-react';
import { createPlayer } from '../services/api';

const AddStats = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '', team: '', position: 'PG', 
    ppg: '', rpg: '', apg: '', spg: '', bpg: '', 
    fgPerc: '', threePerc: '', gamesPlayed: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setStatus({ type: 'error', message: 'Please upload a player image.' });
      return;
    }

    // Create FormData to send file + fields
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    data.append('image', file);

    try {
      await createPlayer(data);
      setStatus({ type: 'success', message: 'Player & stats published successfully!' });
      // Reset form
      setFormData({ name: '', team: '', position: 'PG', ppg: '', rpg: '', apg: '', spg: '', bpg: '', fgPerc: '', threePerc: '', gamesPlayed: '' });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add stats' });
    }
  };

  // Mock Premium Check
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">League Admin Access</h2>
          <p className="text-gray-600 mb-8">You must verify you are a league official to update official NBA-level stats.</p>
          <button onClick={() => setIsSubscribed(true)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
            Access Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-orange-500" /> Official Stat Entry
          </h2>
          <p className="text-gray-400">Enter complete player box score data</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status.message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Player Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="LeBron James" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Team</label>
              <input required name="team" value={formData.team} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Lakers" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Position</label>
              <select name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Player Photo</label>
              <div className="relative border rounded-lg overflow-hidden">
                <input required type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                  <span className="text-gray-500 text-sm truncate">{file ? file.name : 'Choose Image...'}</span>
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">PPG</label>
                <input required type="number" step="0.1" name="ppg" value={formData.ppg} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">RPG</label>
                <input required type="number" step="0.1" name="rpg" value={formData.rpg} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">APG</label>
                <input required type="number" step="0.1" name="apg" value={formData.apg} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">SPG</label>
                <input required type="number" step="0.1" name="spg" value={formData.spg} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">BPG</label>
                <input required type="number" step="0.1" name="bpg" value={formData.bpg} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="0.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">FG%</label>
                <input required type="number" step="0.1" name="fgPerc" value={formData.fgPerc} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="45.5" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">3P%</label>
                <input required type="number" step="0.1" name="threePerc" value={formData.threePerc} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="35.0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Games Played</label>
                <input required type="number" name="gamesPlayed" value={formData.gamesPlayed} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:border-orange-500" placeholder="82" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold shadow-lg transition-transform transform active:scale-95">
            Publish Player Stats
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStats;