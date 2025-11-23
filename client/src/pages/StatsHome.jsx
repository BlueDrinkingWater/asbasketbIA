import React, { useEffect, useState } from 'react';
import { fetchPlayers } from '../services/api';
import { 
  Trophy, Activity, Target, 
  TrendingUp, Zap, Crown, Hand
} from 'lucide-react';

const StatsHome = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const { data } = await fetchPlayers();
        if (data.success) {
          // Enrich with Fantasy Points Calculation
          const enriched = data.data.map(p => ({
            ...p,
            fantasyPoints: parseFloat((
              (p.ppg || 0) * 1 + 
              (p.rpg || 0) * 1.2 + 
              (p.apg || 0) * 1.5 + 
              (p.bpg || 0) * 3 + 
              (p.spg || 0) * 3 - 
              (p.turnovers || 0) * 1
            ).toFixed(1))
          }));
          setPlayers(enriched);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    getPlayers();
  }, []);

  // Helper to get top 5 for a specific category
  const getLeaders = (key) => {
    return [...players]
      .sort((a, b) => (b[key] || 0) - (a[key] || 0))
      .slice(0, 5);
  };

  // Stat Category Config
  const categories = [
    { title: 'Scoring Leaders', key: 'ppg', label: 'PPG', icon: <Target className="w-5 h-5 text-blue-500"/>, color: 'bg-blue-50' },
    { title: 'Rebound Kings', key: 'rpg', label: 'RPG', icon: <Activity className="w-5 h-5 text-green-500"/>, color: 'bg-green-50' },
    { title: 'Assist Masters', key: 'apg', label: 'APG', icon: <TrendingUp className="w-5 h-5 text-purple-500"/>, color: 'bg-purple-50' },
    { title: 'Defensive Anchors', key: 'bpg', label: 'BPG', icon: <Hand className="w-5 h-5 text-red-500"/>, color: 'bg-red-50' },
    { title: 'Steal Specialists', key: 'spg', label: 'SPG', icon: <Zap className="w-5 h-5 text-yellow-500"/>, color: 'bg-yellow-50' },
    { title: 'Fantasy Stars', key: 'fantasyPoints', label: 'FP', icon: <Crown className="w-5 h-5 text-indigo-500"/>, color: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">League Leaders</h1>
        <p className="mt-2 text-lg text-gray-500">Top performers across all major statistical categories</p>
      </div>

      {/* TOP 5 GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((cat) => (
          <div key={cat.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`px-6 py-4 border-b border-gray-50 flex justify-between items-center ${cat.color}`}>
              <h3 className="font-bold text-gray-800">{cat.title}</h3>
              {cat.icon}
            </div>
            <div className="divide-y divide-gray-50">
              {getLeaders(cat.key).map((player, idx) => (
                <div key={player._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className={`w-6 text-sm font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                      {idx + 1}
                    </span>
                    <img 
                      src={player.imageUrl} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover border border-gray-100 mx-3"
                      onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${player.name}`}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">{player.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-bold text-gray-900">{player[cat.key]}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{cat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MVP LEADERBOARD */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
              MVP Race Leaderboard
            </h2>
            <p className="text-indigo-200 text-sm mt-1">Ranked by overall Fantasy Production</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">PTS</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">REB</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">AST</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">STL</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">BLK</th>
                <th className="px-6 py-3 text-center text-xs font-black text-indigo-600 uppercase tracking-wider bg-indigo-50">FP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {getLeaders('fantasyPoints').concat(getLeaders('fantasyPoints').length < 10 ? [] : []).slice(0, 10).map((player, index) => (
                <tr key={player._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm 
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-100 text-gray-700' : 
                        index === 2 ? 'bg-orange-50 text-orange-700' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={player.imageUrl} alt="" onError={(e) => e.target.src=`https://ui-avatars.com/api/?name=${player.name}`}/>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.team} • {player.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 font-medium">{player.ppg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{player.rpg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{player.apg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{player.spg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{player.bpg}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-black text-indigo-600 bg-indigo-50">{player.fantasyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsHome;