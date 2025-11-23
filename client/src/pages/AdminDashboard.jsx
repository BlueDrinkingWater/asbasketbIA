import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, CheckCircle, XCircle, ExternalLink, LayoutDashboard } from 'lucide-react';
import { fetchUsers, updateUserStatus } from '../services/api';
import toast from 'react-hot-toast';

// Import your new Admin Components
import AddGame from './AddGame';
import AddStats from './AddStats';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); // Default to Stats for quick access
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Only load users if that tab is active to save bandwidth
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await fetchUsers();
      if (data.success) setUsers(data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, status) => {
    try {
      await updateUserStatus(userId, status);
      toast.success(`User marked as ${status}`);
      loadUsers(); 
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-indigo-600" /> Admin Control Panel
      </h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`pb-4 px-2 whitespace-nowrap font-medium text-sm transition-colors ${activeTab === 'stats' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Activity className="inline w-4 h-4 mr-2" /> Player Stats
        </button>
        <button 
          onClick={() => setActiveTab('games')} 
          className={`pb-4 px-2 whitespace-nowrap font-medium text-sm transition-colors ${activeTab === 'games' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar className="inline w-4 h-4 mr-2" /> Game Schedule
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`pb-4 px-2 whitespace-nowrap font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="inline w-4 h-4 mr-2" /> Subscriptions
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-2xl p-1 border border-gray-100 min-h-[500px]">
        
        {activeTab === 'stats' && (
          <div className="p-4">
            {/* Reusing your AddStats component */}
            <AddStats />
          </div>
        )}

        {activeTab === 'games' && (
          <div className="p-4">
            {/* Reusing your AddGame component */}
            <AddGame />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">User Management</h2>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                Total: {users.length}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500 animate-pulse">Loading user data...</div>
            ) : (
              <div className="space-y-4">
                {users.length === 0 && <p className="text-center py-10 text-gray-500">No users found.</p>}
                
                {users.map(user => (
                  <div key={user._id} className="border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow bg-white">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-lg text-gray-900">{user.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${getStatusColor(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{user.email} • {user.contactNumber}</p>
                      
                      <div className="flex gap-4 text-xs mt-2">
                        {user.subscriptionExpiresAt && (
                          <span className="text-gray-400">Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}</span>
                        )}
                        
                        {user.paymentProofUrl ? (
                          <a href={user.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center gap-1 font-medium hover:underline">
                            <ExternalLink className="w-3 h-3" /> View Payment Proof
                          </a>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> No Proof</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      {user.subscriptionStatus !== 'active' && (
                        <button 
                          onClick={() => handleStatusUpdate(user._id, 'active')}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleStatusUpdate(user._id, 'inactive')}
                        className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <XCircle className="w-4 h-4" /> Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;