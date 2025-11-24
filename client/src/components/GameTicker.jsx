import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGames } from '../services/api';

const GameTicker = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGames = async () => {
      try {
        const { data } = await fetchGames();
        if (data.success) {
          // Sort live first, then recent
          const sorted = data.data.sort((a, b) => {
             if (a.status === 'live') return -1;
             if (b.status === 'live') return 1;
             return new Date(b.date) - new Date(a.date);
          });
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
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-b border-gray-700 h-10 overflow-hidden relative flex items-center z-40 shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 bg-orange-600 z-10 px-4 flex items-center font-black text-white text-[10px] uppercase tracking-widest shadow-md clip-path-slant">
        LIVE UPDATE
      </div>
      
      <div className="animate-marquee flex items-center space-x-0 hover:pause">
        {games.map((game, idx) => (
          <Link 
            to={`/game/${game._id}`} 
            key={`${game._id}-${idx}`} 
            className="flex items-center space-x-4 flex-shrink-0 text-xs font-medium border-r border-gray-700 px-6 py-2.5 hover:bg-gray-700 transition-colors cursor-pointer group"
          >
            {/* Game Status */}
            <div className="w-14 text-[9px] font-bold leading-tight text-center">
              {game.status === 'live' ? (
                <span className="text-red-400 flex items-center justify-center animate-pulse bg-red-900/30 px-1 rounded">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> LIVE
                </span>
              ) : game.status === 'Final' ? (
                <span className="text-gray-400">FINAL</span>
              ) : (
                <span className="text-orange-300">
                  {new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {/* Teams & Scores */}
            <div className="flex space-x-3 items-center group-hover:scale-105 transition-transform duration-200 origin-left">
              <div className="flex items-center space-x-2">
                <span className={`uppercase tracking-tight ${game.homeScore > game.awayScore ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                  {game.homeTeam?.name || 'Home'} 
                </span>
                <span className="text-gray-600 text-[10px]">vs</span>
                <span className={`uppercase tracking-tight ${game.awayScore > game.homeScore ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                  {game.awayTeam?.name || 'Away'}
                </span>
              </div>
              {(game.status === 'Final' || game.status === 'live') && (
                <div className="font-mono font-bold text-yellow-400 bg-gray-800 px-1.5 rounded text-[10px]">
                  {game.homeScore} - {game.awayScore}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameTicker;