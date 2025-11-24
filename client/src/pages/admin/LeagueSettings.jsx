import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Save, Settings, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const LeagueSettings = () => {
  const [formData, setFormData] = useState({
    seasonName: '',
    currentRound: '',
    isTradeDeadlinePassed: false,
    commissionerMessage: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/settings')
      .then(res => {
        setFormData(res.data.data);
        setLoading(false);
      })
      .catch(() => toast.error('Failed to load settings'));
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/admin/settings', formData);
      toast.success('League settings saved!');
    } catch (error) {
      toast.error('Error saving settings.');
    }
  };

  if (loading) return <div className="p-8">Loading Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6 text-indigo-900">
          <Settings className="w-6 h-6 mr-2" />
          <h2 className="text-2xl font-bold">Commissioner Console</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Season Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Active Season Name</label>
            <input
              type="text"
              name="seasonName"
              value={formData.seasonName}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Winter League 2024"
            />
          </div>

          {/* Round */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Round</label>
            <select
              name="currentRound"
              value={formData.currentRound}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            >
              <option value="Regular Season">Regular Season</option>
              <option value="Playoffs Round 1">Playoffs Round 1</option>
              <option value="Semi-Finals">Semi-Finals</option>
              <option value="Finals">Finals</option>
              <option value="Offseason">Offseason</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <label className="font-bold text-gray-800 cursor-pointer select-none">Lock Trades</label>
              <p className="text-xs text-gray-500">Prevent teams from initiating new trades.</p>
            </div>
            <input
              type="checkbox"
              name="isTradeDeadlinePassed"
              checked={formData.isTradeDeadlinePassed}
              onChange={handleChange}
              className="w-6 h-6 text-indigo-600 rounded"
            />
          </div>

          {/* Announcement */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Commissioner's Message</label>
            <textarea
              name="commissionerMessage"
              value={formData.commissionerMessage}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded transition flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" /> Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeagueSettings;