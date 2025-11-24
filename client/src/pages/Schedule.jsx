import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGames } from '../services/api';
import { Calendar, MapPin } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );
  
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
            <h1 className="text-3xl font-bold text-gray-900">League Schedule & Results</h1>
            <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">{games.length} Games</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games
            .filter(game => game.homeTeam && game.awayTeam) // FILTER BROKEN GAMES
            .map((game) => (
            <Link 
              to={`/game/${game._id}`} 
              key={game._id} 
              className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Status Header */}
              <div className={`px-6 py-3 text-sm font-bold text-white flex justify-between items-center ${
                game.status === 'Final' ? 'bg-gray-900' : game.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
              }`}>
                <span>{game.status.toUpperCase()}</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(game.date).toLocaleDateString()}
                </div>
              </div>

              {/* Matchup */}
              <div className="p-6 group-hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  {/* Home Team */}
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg truncate text-gray-900">{game.homeTeam?.name}</div>
                    {(game.status === 'Final' || game.status === 'live') && (
                      <div className={`text-3xl font-bold mt-2 ${game.homeScore > game.awayScore ? 'text-green-600' : 'text-gray-600'}`}>
                        {game.homeScore}
                      </div>
                    )}
                  </div>

                  <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">VS</div>

                  {/* Away Team */}
                  <div className="text-center w-1/3">
                    <div className="font-bold text-lg truncate text-gray-900">{game.awayTeam?.name}</div>
                    {(game.status === 'Final' || game.status === 'live') && (
                      <div className={`text-3xl font-bold mt-2 ${game.awayScore > game.homeScore ? 'text-green-600' : 'text-gray-600'}`}>
                        {game.awayScore}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  {game.location}
                </div>
              </div>
            </Link>
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