import React, { useState } from 'react';
import { Lock, CheckCircle, AlertTriangle, Upload, Activity, User, X, Plus, Minus, Trophy } from 'lucide-react';
import { createPlayer } from '../services/api';

const AddStats = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, boxscore
  
  const [formData, setFormData] = useState({
    // Profile
    name: '', team: '', position: 'PG', jerseyNumber: '',
    
    // Totals / Stats
    gamesPlayed: '0', minutes: '0',
    
    // Scoring
    pts: '', ppg: '',
    fgm: '', fga: '',
    threePm: '', threePa: '',
    ftm: '', fta: '',
    
    // Rebounding
    oreb: '', dreb: '', reb: '', rpg: '',
    
    // Playmaking & Handling
    ast: '', apg: '', tov: '',
    
    // Defense
    stl: '', spg: '',
    blk: '', bpg: '',
    pf: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === 'number' && value < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  // Helper for "Live" incrementing if manually adding
  const adjustValue = (field, amount) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, (parseInt(prev[field] || 0) + amount).toString())
    }));
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
      setStatus({ type: 'error', message: 'Player photo is required.' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('image', file);

    try {
      await createPlayer(data);
      setStatus({ type: 'success', message: 'Player stats published successfully!' });
      setFormData(Object.keys(formData).reduce((acc, key) => ({...acc, [key]: ''}), {position: 'PG'}));
      removeImage();
      window.scrollTo(0,0);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to save stats.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Official Stat Entry</h2>
          <p className="text-gray-600 mb-8">Restricted to league officials.</p>
          <button onClick={() => setIsSubscribed(true)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
            Enter Console
          </button>
        </div>
      </div>
    );
  }

  // Reusable Input Component
  const StatInput = ({ label, name, placeholder, cols = 1 }) => (
    <div className={`col-span-${cols} space-y-1`}>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        <input 
          type="number" 
          name={name} 
          value={formData[name]} 
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-mono text-sm font-bold text-gray-800" 
          placeholder={placeholder || "0"}
        />
        {/* Mini stepper for manual adjustment */}
        <div className="absolute right-1 flex flex-col gap-[1px]">
           <button type="button" onClick={() => adjustValue(name, 1)} className="p-0.5 bg-gray-200 hover:bg-gray-300 rounded-t text-[8px]"><Plus className="w-2 h-2"/></button>
           <button type="button" onClick={() => adjustValue(name, -1)} className="p-0.5 bg-gray-200 hover:bg-gray-300 rounded-b text-[8px]"><Minus className="w-2 h-2"/></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: IMAGE & CORE INFO */}
        <div className="w-full md:w-1/3 bg-gray-900 p-8 text-white flex flex-col">
           <div className="flex items-center gap-2 mb-8">
              <Activity className="text-orange-500 w-6 h-6" />
              <span className="font-black tracking-tight text-xl">STAT<span className="text-orange-500">CONSOLE</span></span>
           </div>

           {/* Image Upload */}
           <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Player Photo</label>
              <div className={`relative h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                previewUrl ? 'border-orange-500 bg-gray-800' : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
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
                    <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-500">Click to Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${previewUrl ? 'hidden' : ''}`} />
              </div>
           </div>

           <div className="space-y-4 flex-1">
              <div>
                 <label className="text-xs text-gray-500 font-bold uppercase">Full Name</label>
                 <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" placeholder="Player Name" />
              </div>
              <div>
                 <label className="text-xs text-gray-500 font-bold uppercase">Team</label>
                 <input required name="team" value={formData.team} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" placeholder="Team Name" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Position</label>
                    <select name="position" value={formData.position} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm outline-none">
                       {['PG','SG','SF','PF','C'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Jersey #</label>
                    <input name="jerseyNumber" value={formData.jerseyNumber} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" placeholder="23" />
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT CONTENT: STATS FORM */}
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 p-8 overflow-y-auto max-h-screen">
           
           <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Box Score Entry</h2>
              <div className="flex gap-2">
                 <button type="button" onClick={() => setActiveTab('profile')} className={`px-4 py-1 rounded-full text-xs font-bold ${activeTab === 'profile' ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>Overview</button>
                 <button type="button" onClick={() => setActiveTab('boxscore')} className={`px-4 py-1 rounded-full text-xs font-bold ${activeTab === 'boxscore' ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>Detailed Stats</button>
              </div>
           </div>

           {status.message && (
            <div className={`mb-6 p-3 rounded text-sm font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               {status.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
               {status.message}
            </div>
           )}

           <div className="space-y-8">
              {/* SCORING SECTION */}
              <div>
                 <h3 className="text-sm font-black text-gray-900 uppercase mb-3 border-l-4 border-orange-500 pl-2">Scoring</h3>
                 <div className="grid grid-cols-4 gap-3">
                    <StatInput label="PTS" name="pts" placeholder="Points" />
                    <StatInput label="FGM" name="fgm" />
                    <StatInput label="FGA" name="fga" />
                    <div className="flex flex-col justify-end pb-2 text-xs font-mono text-gray-500">
                       FG%: {formData.fga > 0 ? ((formData.fgm / formData.fga) * 100).toFixed(1) : 0}%
                    </div>
                    <StatInput label="3PM" name="threePm" />
                    <StatInput label="3PA" name="threePa" />
                    <StatInput label="FTM" name="ftm" />
                    <StatInput label="FTA" name="fta" />
                 </div>
              </div>

              {/* REBOUNDING & PLAYMAKING */}
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase mb-3 border-l-4 border-blue-500 pl-2">Rebounding</h3>
                    <div className="grid grid-cols-3 gap-2">
                       <StatInput label="OREB" name="oreb" />
                       <StatInput label="DREB" name="dreb" />
                       <StatInput label="TOT REB" name="reb" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase mb-3 border-l-4 border-green-500 pl-2">Playmaking</h3>
                    <div className="grid grid-cols-3 gap-2">
                       <StatInput label="AST" name="ast" />
                       <StatInput label="TOV" name="tov" />
                       <StatInput label="MIN" name="minutes" />
                    </div>
                 </div>
              </div>

              {/* DEFENSE */}
              <div>
                 <h3 className="text-sm font-black text-gray-900 uppercase mb-3 border-l-4 border-red-500 pl-2">Defense & Other</h3>
                 <div className="grid grid-cols-4 gap-3">
                    <StatInput label="STL" name="stl" />
                    <StatInput label="BLK" name="blk" />
                    <StatInput label="PF" name="pf" />
                    <StatInput label="Games" name="gamesPlayed" />
                 </div>
              </div>
           </div>

           <button 
              type="submit" 
              disabled={loading}
              className="mt-8 w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
           >
              {loading ? 'Saving...' : <><Trophy className="w-4 h-4"/> Publish Player Data</>}
           </button>

        </form>
      </div>
    </div>
  );
};

export default AddStats;