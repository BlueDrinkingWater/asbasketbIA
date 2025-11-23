import React, { useState, useEffect } from 'react';
import { Users, Calendar, Settings, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { fetchUsers, updateUserStatus } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
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
      loadUsers(); // Refresh list
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
        <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
          <Users className="inline w-4 h-4 mr-2" /> Subscriptions
        </button>
        {/* Add other tabs logic later */}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Subscriptions</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {users.length === 0 && <p className="text-gray-500">No users found.</p>}
                
                {users.map(user => (
                  <div key={user._id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{user.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${getStatusColor(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email} | {user.contactNumber}</p>
                      
                      {user.subscriptionExpiresAt && (
                        <p className="text-xs text-gray-500 mt-1">Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}</p>
                      )}
                      
                      {user.paymentProofUrl ? (
                        <a href={user.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm flex items-center gap-1 mt-1 hover:underline">
                          <ExternalLink className="w-3 h-3" /> View Payment Proof
                        </a>
                      ) : (
                        <span className="text-xs text-red-400">No proof uploaded</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {user.subscriptionStatus !== 'active' && (
                        <button 
                          onClick={() => handleStatusUpdate(user._id, 'active')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve (30 Days)
                        </button>
                      )}
                      <button 
                        onClick={() => handleStatusUpdate(user._id, 'inactive')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm flex items-center gap-2"
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