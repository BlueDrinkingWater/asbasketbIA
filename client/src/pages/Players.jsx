import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
// FIX: Explicitly add .jsx extension to ensure resolution
import { useApi } from '../hooks/useApi.jsx'; 
import { fetchPlayers } from '../services/api';
import io from 'socket.io-client';

const Players = () => {
  const [filters, setFilters] = useState({ search: '', position: '', team: '' });
  const [page, setPage] = useState(1);
  
  const queryParams = { ...filters, page, limit: 12 };
  // Ensure fetchPlayers is defined in services/api.js
  const { data: response, loading, error, refetch } = useApi(() => fetchPlayers(queryParams), [page, JSON.stringify(filters)]);
  
  const players = response?.data || [];
  const pagination = response?.pagination || { pages: 1 };

  // Socket.io for real-time updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('players_updated', () => {
      refetch();
    });
    return () => socket.disconnect();
  }, [refetch]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search player or team..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                onChange={(e) => handleFilter('search', e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              onChange={(e) => handleFilter('position', e.target.value)}
            >
              <option value="">All Positions</option>
              <option value="PG">Point Guard</option>
              <option value="SG">Shooting Guard</option>
              <option value="SF">Small Forward</option>
              <option value="PF">Power Forward</option>
              <option value="C">Center</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : error ? (
           <div className="text-center py-12 text-red-500 bg-white rounded-xl shadow-sm">
             <AlertCircle className="w-12 h-12 mx-auto mb-4" />
             <p>{error}</p>
           </div>
        ) : (
          <>
            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {players.map(player => (
                <div key={player._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-64 overflow-hidden bg-gray-100 relative">
                    {player.imageUrl ? (
                      <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {player.position}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{player.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{player.team}</p>
                    <div className="grid grid-cols-3 gap-2 border-t pt-4">
                      <div className="text-center">
                        <span className="block text-xs text-gray-400">PPG</span>
                        <span className="font-bold text-gray-800">{player.ppg}</span>
                      </div>
                      <div className="text-center border-l border-gray-100">
                        <span className="block text-xs text-gray-400">RPG</span>
                        <span className="font-bold text-gray-800">{player.rpg}</span>
                      </div>
                      <div className="text-center border-l border-gray-100">
                        <span className="block text-xs text-gray-400">APG</span>
                        <span className="font-bold text-gray-800">{player.apg}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-white border rounded-lg font-medium">{page} / {pagination.pages}</span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Players;