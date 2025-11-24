import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { TrendingUp, Hash, User } from 'lucide-react';

const StatsLeaderboard = () => {
  const [category, setCategory] = useState('points');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'points', label: 'Points' },
    { id: 'rebounds', label: 'Rebounds' },
    { id: 'assists', label: 'Assists' },
    { id: 'steals', label: 'Steals' },
    { id: 'blocks', label: 'Blocks' }
  ];

  useEffect(() => {
    setLoading(true);
    API.get(`/stats/leaders?category=${category}`)
      .then(res => {
        setLeaders(res.data.data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center uppercase italic">
            <TrendingUp className="w-8 h-8 text-orange-600 mr-2" /> League Leaders
          </h1>
          
          {/* Category Filter */}
          <div className="flex space-x-2 mt-4 md:mt-0 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                  category === cat.id 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading Data...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-4 font-mono text-sm w-16">Rank</th>
                  <th className="p-4 font-mono text-sm">Player</th>
                  <th className="p-4 font-mono text-sm hidden md:table-cell">Team</th>
                  <th className="p-4 font-mono text-sm text-right text-orange-400 font-bold text-lg">
                    {category.toUpperCase()}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaders.map((stat, index) => (
                  <tr key={stat._id} className="hover:bg-gray-50 transition group cursor-pointer">
                    <td className="p-4 text-gray-400 font-bold font-mono">#{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={stat.player?.imageUrl || 'https://via.placeholder.com/40'} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          alt="" 
                        />
                        <div>
                          <p className="font-bold text-gray-900">{stat.player?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{stat.player?.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                      {stat.team?.name || 'Free Agent'}
                    </td>
                    <td className="p-4 text-right font-black text-2xl text-gray-800 font-mono group-hover:text-orange-600 transition">
                      {stat[category]}
                    </td>
                  </tr>
                ))}
                {leaders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">No stats recorded for this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default StatsLeaderboard;