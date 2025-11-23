import React, { useEffect, useState } from 'react';
import { fetchStandings, fetchPlayers } from '../services/api';
import io from 'socket.io-client';
import { Trophy, User, Users } from 'lucide-react';

const Standings = () => {
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' or 'players'
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data Function
  const loadData = async () => {
    setLoading(true);
    try {
      // Load Team Standings
      const teamsRes = await fetchStandings();
      setTeams(teamsRes.data.data || []);

      // Load Player Standings (Leaderboard) - backend sorts by PPG desc automatically
      const playersRes = await fetchPlayers({ limit: 50 }); 
      setPlayers(playersRes.data.data || []);
    } catch (error) {
      console.error("Error loading standings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Socket.io for live updates
    const socket = io('http://localhost:5000');
    socket.on('standings_updated', loadData);
    socket.on('players_updated', loadData);
    socket.on('game_updated', loadData);

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="text-orange-600 w-8 h-8" /> League Standings
          </h1>
          
          {/* Toggle Tabs */}
          <div className="mt-4 md:mt-0 bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
            <button 
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'teams' ? 'bg-orange-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" /> Teams
            </button>
            <button 
              onClick={() => setActiveTab('players')}
              className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'players' ? 'bg-orange-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" /> Players
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-10 text-center text-gray-500 animate-pulse">Loading latest stats...</div>
          ) : activeTab === 'teams' ? (
            /* TEAM STANDINGS TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">Team</th>
                    <th className="px-6 py-4 font-bold text-center">Conference</th>
                    <th className="px-6 py-4 font-bold text-center">Wins</th>
                    <th className="px-6 py-4 font-bold text-center">Losses</th>
                    <th className="px-6 py-4 font-bold text-center">Win %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map((team, index) => (
                    <tr key={team._id} className="hover:bg-orange-50 transition-colors group">
                      <td className="px-6 py-4 text-gray-400 font-mono font-bold group-hover:text-orange-600">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                        {/* Placeholder for logo if you add logo support later */}
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                        {team.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          team.conference === 'East' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {team.conference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-green-600">{team.wins}</td>
                      <td className="px-6 py-4 text-center font-medium text-red-600">{team.losses}</td>
                      <td className="px-6 py-4 text-center font-mono text-sm">
                        {team.winPercentage || (team.wins + team.losses > 0 ? (team.wins / (team.wins + team.losses)).toFixed(3) : '.000')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* PLAYER STANDINGS TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">Player</th>
                    <th className="px-6 py-4 font-bold">Team</th>
                    <th className="px-6 py-4 font-bold text-center">PPG</th>
                    <th className="px-6 py-4 font-bold text-center">RPG</th>
                    <th className="px-6 py-4 font-bold text-center">APG</th>
                    <th className="px-6 py-4 font-bold text-center">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map((player, index) => (
                    <tr key={player._id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-mono font-bold">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                            <img src={player.imageUrl || 'https://via.placeholder.com/40'} alt={player.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{player.team}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900 text-lg">{player.ppg}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{player.rpg}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{player.apg}</td>
                      <td className="px-6 py-4 text-center font-mono text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">FG: {player.fgPerc}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Standings;