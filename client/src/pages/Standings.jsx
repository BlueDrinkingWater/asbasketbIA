import React from 'react';
import { useApi } from '../hooks/useApi';
import { fetchStandings } from '../services/api';

const Standings = () => {
  const { data, loading } = useApi(fetchStandings);
  const teams = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">League Standings</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Team</th>
                  <th className="px-6 py-4 font-semibold text-center">W</th>
                  <th className="px-6 py-4 font-semibold text-center">L</th>
                  <th className="px-6 py-4 font-semibold text-center">PCT</th>
                  <th className="px-6 py-4 font-semibold text-center">Conf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading standings...</td></tr>
                ) : teams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                    <td className="px-6 py-4 text-center">{team.wins}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{team.losses}</td>
                    <td className="px-6 py-4 text-center font-mono text-sm">{team.winPercentage}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        team.conference === 'East' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {team.conference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standings;