import React, { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, Upload, Activity, User, X } from 'lucide-react';
import { createPlayer } from '../services/api';

const AddStats = () => {
  const [isSubscribed, setIsSubscribed] = useState(false); // Simulating Admin Auth
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: '', team: '', position: 'PG', 
    ppg: '', rpg: '', apg: '', spg: '', bpg: '', 
    fgPerc: '', threePerc: '', gamesPlayed: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Basic validation for negative numbers
    if (e.target.type === 'number' && value < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    if (!file) {
      setStatus({ type: 'error', message: 'Please upload a player photo to proceed.' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    // IMPT: Must match 'photo' as defined in server/routes/playerRoutes.js
    data.append('photo', file); 

    try {
      await createPlayer(data);
      setStatus({ type: 'success', message: 'Player stats published successfully!' });
      setFormData({ 
        name: '', team: '', position: 'PG', 
        ppg: '', rpg: '', apg: '', spg: '', bpg: '', 
        fgPerc: '', threePerc: '', gamesPlayed: '' 
      });
      removeImage();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to save stats. Please check your input.' });
    } finally {
      setLoading(false);
    }
  };

  // Mock Admin Access Check
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-8">Verify your credentials to update official league statistics.</p>
          <button onClick={() => setIsSubscribed(true)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
            Enter Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-orange-500" /> Player Statistics
            </h2>
            <p className="text-gray-400 text-sm mt-1">Create new player profile and assign season stats</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {status.message}
            </div>
          )}

          {/* TOP SECTION: Image & Core Info */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Image Upload Area */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              <label className="block text-sm font-bold text-gray-700 mb-2">Player Photo <span className="text-red-500">*</span></label>
              <div className={`relative h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                previewUrl ? 'border-orange-500 bg-white' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}>
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-500 font-medium">Click to Upload Photo</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${previewUrl ? 'hidden' : ''}`} />
              </div>
            </div>

            {/* Core Details */}
            <div className="w-full md:w-2/3 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input required name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="e.g. Stephen Curry" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Team Name</label>
                  <input required name="team" value={formData.team} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="e.g. Golden State Warriors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Position</label>
                <div className="grid grid-cols-5 gap-2">
                  {['PG', 'SG', 'SF', 'PF', 'C'].map((pos) => (
                    <button
                      type="button"
                      key={pos}
                      onClick={() => setFormData({...formData, position: pos})}
                      className={`py-2 rounded-lg text-sm font-bold border ${
                        formData.position === pos 
                        ? 'bg-orange-600 text-white border-orange-600' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" /> Performance Data
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Points (PPG)', name: 'ppg', ph: '25.4' },
                { label: 'Rebounds (RPG)', name: 'rpg', ph: '5.2' },
                { label: 'Assists (APG)', name: 'apg', ph: '6.3' },
                { label: 'Steals (SPG)', name: 'spg', ph: '1.2' },
                { label: 'Blocks (BPG)', name: 'bpg', ph: '0.8' },
                { label: 'Field Goal %', name: 'fgPerc', ph: '48.5' },
                { label: '3-Point %', name: 'threePerc', ph: '42.1' },
                { label: 'Games Played', name: 'gamesPlayed', ph: '82' }
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{field.label}</label>
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    name={field.name} 
                    value={formData[field.name]} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-mono text-gray-800" 
                    placeholder={field.ph} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white transform active:scale-[0.99]'
              }`}
            >
              {loading ? 'Publishing...' : 'Publish Player & Stats'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStats;