import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStandings, fetchPlayers } from '../services/api';
import { Minus, TrendingUp, TrendingDown, Users, BarChart2 } from 'lucide-react';

const Standings = () => {
  const [activeTab, setActiveTab] = useState('teams'); 
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'fantasyPoints', direction: 'desc' });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'teams') {
          const { data } = await fetchStandings();
          if (data.success) {
            const sorted = data.data.sort((a, b) => {
              const wpA = (a.wins + a.losses) === 0 ? 0 : a.wins / (a.wins + a.losses);
              const wpB = (b.wins + b.losses) === 0 ? 0 : b.wins / (b.wins + b.losses);
              if (wpB !== wpA) return wpB - wpA;
              return b.wins - a.wins;
            });
            setTeams(sorted);
          }
        } else {
          const { data } = await fetchPlayers();
          if (data.success) {
            const enriched = data.data.map(p => ({
              ...p,
              fantasyPoints: (
                (p.ppg || 0) * 1 + 
                (p.rpg || 0) * 1.2 + 
                (p.apg || 0) * 1.5 + 
                (p.bpg || 0) * 3 + 
                (p.spg || 0) * 3 - 
                (p.turnovers || 0) * 1
              ).toFixed(1)
            }));
            setPlayers(enriched);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const valA = parseFloat(a[sortConfig.key]) || 0;
    const valB = parseFloat(b[sortConfig.key]) || 0;
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStreak = (wins, losses) => {
      if (wins > losses) return <span className="text-green-600 font-bold flex items-center justify-center"><TrendingUp className="w-3 h-3 mr-1"/> W1</span>;
      if (losses > wins) return <span className="text-red-600 font-bold flex items-center justify-center"><TrendingDown className="w-3 h-3 mr-1"/> L1</span>;
      return <span className="text-gray-400 flex items-center justify-center"><Minus className="w-3 h-3" /></span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          League Statistics
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Official rankings and statistical leaders
        </p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'teams' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" /> Team Standings
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'players' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" /> Player Stats
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            
            {/* TEAM TABLE */}
            {activeTab === 'teams' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-16">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-20">W</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-20">L</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-24">PCT</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider hidden sm:table-cell w-32">Conf</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider hidden md:table-cell w-32">Streak</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {teams.map((team, index) => {
                    const totalGames = team.wins + team.losses;
                    const pct = totalGames === 0 ? ".000" : (team.wins / totalGames).toFixed(3).substring(1);
                    
                    return (
                      <tr key={team._id} className="hover:bg-indigo-50/30 transition-colors duration-150 group">
                        <td className="px-6 py-4 text-center font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <Link to={`/players?search=${encodeURIComponent(team.name)}`} className="flex items-center group-hover:translate-x-1 transition-transform">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-indigo-800 font-bold border border-gray-200 overflow-hidden">
                               <img 
                                 className="h-10 w-10 object-cover" 
                                 src={team.logoUrl || `https://ui-avatars.com/api/?name=${team.name}&background=random`}
                                 alt={team.name}
                                 onError={(e) => {
                                   e.target.onerror = null;
                                   e.target.src = `https://ui-avatars.com/api/?name=${team.name}&background=random`;
                                 }} 
                               />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600">{team.name}</div>
                              <div className="text-xs text-gray-500 sm:hidden">{team.conference}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">{team.wins}</td>
                        <td className="px-6 py-4 text-center font-medium text-gray-500">{team.losses}</td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-indigo-600">{pct}</td>
                        <td className="px-6 py-4 text-center hidden sm:table-cell">
                          <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-bold rounded-full ${team.conference === 'East' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                            {team.conference}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center hidden md:table-cell">{getStreak(team.wins, team.losses)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* PLAYER TABLE */}
            {activeTab === 'players' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Player</th>
                    {['ppg', 'rpg', 'apg', 'bpg', 'spg', 'turnovers', 'threeMade', 'ftMade', 'fantasyPoints'].map(key => (
                      <th 
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`px-2 py-3 text-center text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-indigo-800 transition-colors ${sortConfig.key === key ? 'bg-indigo-800' : ''}`}
                      >
                        <div className="flex items-center justify-center">
                          {key === 'fantasyPoints' ? 'FP' : key === 'threeMade' ? '3PM' : key === 'ftMade' ? 'FTM' : key === 'turnovers' ? 'TO' : key.toUpperCase().replace('PG', '')}
                          {sortConfig.key === key && (
                            sortConfig.direction === 'desc' ? <TrendingDown className="w-3 h-3 ml-1"/> : <TrendingUp className="w-3 h-3 ml-1"/>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedPlayers.map((player, index) => (
                    <tr key={player._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/players?search=${encodeURIComponent(player.name)}`} className="flex items-center">
                          <img 
                            className="h-8 w-8 rounded-full object-cover border border-gray-200" 
                            src={player.imageUrl || `https://ui-avatars.com/api/?name=${player.name}&background=random`} 
                            alt={player.name}
                            onError={(e) => {e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${player.name}`;}}
                          />
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.team} • {player.position}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.ppg}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.rpg}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.apg}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.bpg}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.spg}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.turnovers}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.threeMade}</td>
                      <td className="px-2 py-3 text-center text-sm font-medium text-gray-700">{player.ftMade}</td>
                      <td className="px-2 py-3 text-center text-sm font-bold text-green-600 bg-green-50">{player.fantasyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;