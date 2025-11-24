import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Trophy, Users, Activity } from 'lucide-react';

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Team Info
        // Note: You might need to create a specific route /teams/:id in backend if not exists
        // For now, we simulate finding from the full list or assume endpoint exists
        const teamRes = await API.get('/teams'); 
        const foundTeam = teamRes.data.data.find(t => t._id === id);
        setTeam(foundTeam);

        // 2. Fetch Roster (Players belonging to this team)
        // Backend controller needs to support filtering by team, e.g., /players?team=ID
        const playerRes = await API.get('/players');
        // Client side filtering if backend doesn't support query params yet
        const teamPlayers = playerRes.data.data.filter(p => 
            (typeof p.team === 'object' ? p.team._id === id : p.team === id) || 
            (p.team === foundTeam?.name) // Fallback for string names
        );
        setRoster(teamPlayers);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-white p-10">Loading Team...</div>;
  if (!team) return <div className="text-red-500 p-10">Team not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8">
            <img src={team.logoUrl} className="w-32 h-32 bg-white rounded-full p-2 object-contain" alt={team.name} />
            <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter">{team.name}</h1>
                <div className="flex gap-6 mt-4 text-indigo-200 font-mono">
                    <span>{team.conference} Conference</span>
                    <span>|</span>
                    <span>Est. 2024</span>
                </div>
            </div>
            <div className="ml-auto text-center hidden md:block">
                <div className="text-4xl font-bold">{team.wins} - {team.losses}</div>
                <div className="text-xs uppercase tracking-widest opacity-70">Season Record</div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-2"/> Active Roster
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-3">Player</th>
                            <th className="px-6 py-3">Pos</th>
                            <th className="px-6 py-3 text-right">PPG</th>
                            <th className="px-6 py-3 text-right">RPG</th>
                            <th className="px-6 py-3 text-right">APG</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {roster.map(player => (
                            <tr key={player._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={player.imageUrl} className="w-10 h-10 rounded-full bg-gray-200" alt="" />
                                    <div>
                                        <p className="font-bold text-gray-900">{player.name}</p>
                                        <p className="text-xs text-gray-500">#{player.jerseyNumber}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">{player.position}</td>
                                <td className="px-6 py-4 text-right font-mono font-bold">{player.ppg}</td>
                                <td className="px-6 py-4 text-right font-mono text-gray-600">{player.rpg}</td>
                                <td className="px-6 py-4 text-right font-mono text-gray-600">{player.apg}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {roster.length === 0 && <p className="p-6 text-center text-gray-500">No players found.</p>}
            </div>
        </div>

        {/* Team Stats / Info */}
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center"><Activity className="mr-2 w-5 h-5 text-orange-500"/> Season Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Points Per Game</span>
                        <span className="font-bold">102.4</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Rebounds Per Game</span>
                        <span className="font-bold">45.2</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Assists Per Game</span>
                        <span className="font-bold">24.1</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Win Streak</span>
                        <span className="font-bold text-green-600">W3</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;