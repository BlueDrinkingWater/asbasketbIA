import React, { useEffect, useState } from 'react';
import { fetchGames } from '../services/api';

const GameTicker = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGames = async () => {
      try {
        const { data } = await fetchGames();
        if (data.success) {
          const sorted = data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
          // Duplicate for infinite scroll effect
          setGames([...sorted, ...sorted]); 
        }
      } catch (error) {
        console.error('Error fetching games for ticker:', error);
      } finally {
        setLoading(false);
      }
    };
    getGames();
  }, []);

  if (loading || games.length === 0) return null;

  return (
    <div className="bg-gray-900 text-white border-b border-gray-800 h-12 overflow-hidden relative flex items-center z-40">
      <div className="absolute left-0 top-0 bottom-0 bg-gray-900 z-10 px-3 flex items-center font-black text-yellow-500 text-xs tracking-widest border-r border-gray-800 shadow-lg">
        SCORES
      </div>
      
      <div className="animate-marquee flex items-center space-x-8 pl-4">
        {games.map((game, idx) => (
          <div key={`${game._id}-${idx}`} className="flex items-center space-x-4 flex-shrink-0 text-xs font-medium border-r border-gray-800 pr-8 last:border-0">
            
            {/* Game Status */}
            <div className="w-16 text-gray-400 text-[10px] leading-tight">
              {game.status === 'live' ? (
                <span className="text-red-500 font-bold flex items-center animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> LIVE
                </span>
              ) : game.status === 'Final' ? (
                <span className="font-bold text-gray-500">FINAL</span>
              ) : (
                <span className="flex items-center">
                  {new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Teams & Scores - FIXED: Safe access to team names */}
            <div className="flex space-x-3 items-center">
              <div className="flex items-center space-x-2">
                <span className={`font-bold uppercase ${game.homeScore > game.awayScore ? 'text-white' : 'text-gray-400'}`}>
                  {game.homeTeam?.name || 'TBD'} 
                </span>
                <span className="text-gray-500 text-[10px] bg-gray-800 px-1 rounded">vs</span>
                <span className={`font-bold uppercase ${game.awayScore > game.homeScore ? 'text-white' : 'text-gray-400'}`}>
                  {game.awayTeam?.name || 'TBD'}
                </span>
              </div>
              {(game.status === 'Final' || game.status === 'live') && (
                <div className="font-mono font-bold text-yellow-400">
                  {game.homeScore} - {game.awayScore}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameTicker;