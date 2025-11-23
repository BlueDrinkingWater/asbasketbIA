import React, { useState } from 'react';
import { Users, Calendar, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
        >
          <Users className="inline w-4 h-4 mr-2" /> Manage Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('games')}
          className={`pb-2 px-4 ${activeTab === 'games' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
        >
          <Calendar className="inline w-4 h-4 mr-2" /> Manage Schedule
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
        >
          <Settings className="inline w-4 h-4 mr-2" /> CMS Settings
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
            {/* Map through pending users here */}
            <div className="border rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-500">Payment Proof: <a href="#" className="text-blue-500 underline">View</a></p>
              </div>
              <div className="space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Approve</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Game</h2>
            <form className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Home Team" className="border p-2 rounded" />
              <input type="text" placeholder="Away Team" className="border p-2 rounded" />
              <input type="datetime-local" className="border p-2 rounded" />
              <input type="text" placeholder="Location" className="border p-2 rounded" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded col-span-2">Add to Schedule</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;