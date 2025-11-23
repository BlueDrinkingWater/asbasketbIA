import React, { useEffect, useState } from 'react';
import { fetchStandings } from '../services/api'; // Ensure this is exported in api.js (using fetchTeams)
import { Trophy, Minus, TrendingUp, TrendingDown, Shield } from 'lucide-react';

const Standings = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTeams = async () => {
      try {
        const { data } = await fetchStandings();
        if (data.success) {
          // Sort by win percentage, then total wins
          const sorted = data.data.sort((a, b) => {
            const wpA = (a.wins + a.losses) === 0 ? 0 : a.wins / (a.wins + a.losses);
            const wpB = (b.wins + b.losses) === 0 ? 0 : b.wins / (b.wins + b.losses);
            
            if (wpB !== wpA) return wpB - wpA; // Higher % first
            return b.wins - a.wins; // More wins second
          });
          setTeams(sorted);
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
      } finally {
        setLoading(false);
      }
    };
    getTeams();
  }, []);

  // Helper to display streak (Placeholder logic based on win/loss comparison)
  const getStreak = (wins, losses) => {
      // In a real app, this would come from the backend game history
      if (wins > losses) return <span className="text-green-600 font-bold flex items-center justify-center"><TrendingUp className="w-3 h-3 mr-1"/> W1</span>;
      if (losses > wins) return <span className="text-red-600 font-bold flex items-center justify-center"><TrendingDown className="w-3 h-3 mr-1"/> L1</span>;
      return <span className="text-gray-400 flex items-center justify-center"><Minus className="w-3 h-3" /></span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          League Standings
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Official team rankings and conference leaders
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-900 text-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-16">Rank</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-20">W</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-20">L</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-24">PCT</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider hidden sm:table-cell w-32">Conf</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider hidden md:table-cell w-32">Streak</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {teams.map((team, index) => {
                  const totalGames = team.wins + team.losses;
                  const pct = totalGames === 0 ? ".000" : (team.wins / totalGames).toFixed(3).substring(1); // Remove leading zero
                  
                  return (
                    <tr key={team._id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-indigo-800 font-bold border border-gray-200 shadow-sm">
                             {/* Logo Logic: Use image if available, else Initials */}
                             {team.logoUrl && !team.logoUrl.includes('placeholder') ? (
                                <img className="h-8 w-8 rounded-full object-contain" src={team.logoUrl} alt="" onError={(e) => e.target.style.display='none'} />
                             ) : (
                                team.name.substring(0, 2).toUpperCase()
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{team.name}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{team.conference}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">{team.wins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-500">{team.losses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold text-indigo-600">{pct}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden sm:table-cell">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-4 font-bold rounded-full ${team.conference === 'East' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {team.conference}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                        {getStreak(team.wins, team.losses)}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Placeholder Row if Empty */}
                {teams.length === 0 && (
                   <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-gray-400 bg-gray-50 rounded-b-lg">
                        <Shield className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p>No teams registered yet.</p>
                        <p className="text-xs mt-1">Teams will appear here once approved by the admin.</p>
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;