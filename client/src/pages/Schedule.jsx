import React, { useEffect, useState } from 'react';
import { fetchGames } from '../services/api';
import { Calendar, MapPin, Trophy } from 'lucide-react';

const Schedule = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGames = async () => {
      try {
        const { data } = await fetchGames();
        setGames(data.data);
      } catch (err) {
        setError('Unable to load schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  if (loading) return <div className="text-center py-10">Loading Schedule...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">League Schedule & Results</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div key={game._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Header */}
              <div className={`px-6 py-3 text-sm font-bold text-white flex justify-between items-center ${
                game.status === 'Final' ? 'bg-gray-900' : 'bg-orange-600'
              }`}>
                <span>{game.status.toUpperCase()}</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(game.date).toLocaleDateString()}
                </div>
              </div>

              {/* Matchup */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  {/* Home Team */}
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg truncate">{game.homeTeam?.name}</div>
                    {game.status === 'Final' && (
                      <div className={`text-3xl font-bold mt-2 ${game.homeScore > game.awayScore ? 'text-green-600' : 'text-gray-600'}`}>
                        {game.homeScore}
                      </div>
                    )}
                  </div>

                  <div className="text-gray-400 font-bold">VS</div>

                  {/* Away Team */}
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg truncate">{game.awayTeam?.name}</div>
                    {game.status === 'Final' && (
                      <div className={`text-3xl font-bold mt-2 ${game.awayScore > game.homeScore ? 'text-green-600' : 'text-gray-600'}`}>
                        {game.awayScore}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {game.location}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {games.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No games scheduled yet.</div>
        )}
      </div>
    </div>
  );
};

export default Schedule;