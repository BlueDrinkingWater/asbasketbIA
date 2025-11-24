import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchGames, fetchPlayers } from '../services/api'; // Assume these exist

const socket = io("http://localhost:5000");

const LiveScoreboard = ({ gameId }) => {
  const [timer, setTimer] = useState({ minutes: 12, seconds: 0, shotClock: 24, period: 1 });
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [gameDetails, setGameDetails] = useState(null);
  // Local state for box score tally
  const [playerStats, setPlayerStats] = useState({}); 

  useEffect(() => {
    if (!gameId) return;

    // Load initial game data to get team names and players
    const loadGameContext = async () => {
        try {
            // 1. Get Game Info (Teams)
            const gameRes = await fetchGames(); // Or fetchGame(id)
            const game = gameRes.data.data.find(g => g._id === gameId);
            if(game) {
                setGameDetails(game);
                setScores({ home: game.homeScore, away: game.awayScore });
            }

            // 2. Get Players (In a real app, you'd fetch stats specific to this gameId)
            // For now, we fetch all players and filter by the teams in the game
            if(game) {
                const playerRes = await fetchPlayers();
                const relevantPlayers = playerRes.data.data.filter(p => 
                    p.team === game.homeTeam?.name || p.team === game.awayTeam?.name
                );
                
                // Initialize local stats map
                const statsMap = {};
                relevantPlayers.forEach(p => {
                    statsMap[p._id] = { ...p, points: 0, fouls: 0 }; // Start fresh for live game view
                });
                setPlayerStats(statsMap);
            }
        } catch (e) {
            console.error("Failed to load game context", e);
        }
    };
    loadGameContext();

    socket.emit('join_game', gameId);

    // LISTENERS
    socket.on('receive_timer_update', (data) => {
      setTimer(prev => ({ ...prev, ...data }));
    });

    // Update Box Score and Total Score when a play happens
    socket.on('receive_stat_update', (data) => {
        // data format assumed: { homeScore, awayScore, playerId, pointsAdded, ... }
        setScores({ home: data.homeScore, away: data.awayScore });
        
        if (data.playerId) {
            setPlayerStats(prev => ({
                ...prev,
                [data.playerId]: {
                    ...prev[data.playerId],
                    points: (prev[data.playerId]?.points || 0) + (data.pointsAdded || 0)
                }
            }));
        }
    });

    return () => {
      socket.off('receive_timer_update');
      socket.off('receive_stat_update');
    };
  }, [gameId]);

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  const getTeamPlayers = (teamName) => {
      return Object.values(playerStats).filter(p => p.team === teamName);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* JUMBOTRON SCOREBOARD */}
      <div className="bg-black text-white rounded-3xl shadow-2xl border-4 border-gray-800 overflow-hidden relative">
        
        {/* Top Bar */}
        <div className="bg-gray-900/80 backdrop-blur py-2 px-6 flex justify-between items-center border-b border-gray-800">
            <span className="text-xs font-bold tracking-[0.2em] text-red-500 animate-pulse">● LIVE BROADCAST</span>
            <span className="text-xs font-mono text-gray-400">ASBASKETBIA ARENA</span>
        </div>

        {/* Main Score Display */}
        <div className="p-8 flex items-center justify-between relative bg-gradient-to-b from-gray-900 to-black">
            {/* Home Team */}
            <div className="flex-1 text-center border-r border-gray-800/50">
                <div className="text-5xl md:text-7xl font-black text-orange-500 tabular-nums tracking-tighter drop-shadow-lg">
                    {scores.home}
                </div>
                <div className="text-xl md:text-2xl font-bold uppercase tracking-wider mt-2 font-mono text-gray-300">
                    {gameDetails?.homeTeam?.name || 'HOME'}
                </div>
                <div className="text-xs text-gray-500 mt-1">TIMEOUTS: 3</div>
            </div>

            {/* Clock Center */}
            <div className="w-1/3 flex flex-col items-center justify-center px-4 z-10">
                <div className="bg-gray-900 border-2 border-gray-700 rounded-lg px-6 py-3 mb-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-white tabular-nums tracking-tight leading-none">
                        {formatTime(timer.minutes)}:{formatTime(timer.seconds)}
                    </div>
                </div>
                <div className="flex gap-3 w-full justify-center">
                    <div className="bg-black border border-gray-700 rounded px-3 py-1 text-center min-w-[70px]">
                        <span className="block text-[10px] text-gray-500 font-bold">SHOT</span>
                        <span className="text-2xl font-mono font-bold text-yellow-400">{timer.shotClock}</span>
                    </div>
                    <div className="bg-black border border-gray-700 rounded px-3 py-1 text-center min-w-[70px]">
                        <span className="block text-[10px] text-gray-500 font-bold">QTR</span>
                        <span className="text-2xl font-mono font-bold text-red-500">{timer.period || 1}</span>
                    </div>
                </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center border-l border-gray-800/50">
                <div className="text-5xl md:text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                    {scores.away}
                </div>
                <div className="text-xl md:text-2xl font-bold uppercase tracking-wider mt-2 font-mono text-gray-300">
                    {gameDetails?.awayTeam?.name || 'AWAY'}
                </div>
                <div className="text-xs text-gray-500 mt-1">TIMEOUTS: 2</div>
            </div>
        </div>
      </div>

      {/* LIVE BOX SCORE TALLY */}
      <div className="grid md:grid-cols-2 gap-6">
          {/* Home Team Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 uppercase">{gameDetails?.homeTeam?.name || 'Home'} Stats</h3>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">LIVE</span>
              </div>
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                          <th className="px-4 py-2 font-medium">Player</th>
                          <th className="px-4 py-2 text-center font-medium">PTS</th>
                          <th className="px-4 py-2 text-center font-medium">PF</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {getTeamPlayers(gameDetails?.homeTeam?.name).map(player => (
                          <tr key={player._id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-900 flex items-center">
                                  <span className="text-gray-400 w-6 text-xs mr-1">#{player.jerseyNumber}</span>
                                  {player.name}
                              </td>
                              <td className="px-4 py-2 text-center font-bold">{player.points}</td>
                              <td className="px-4 py-2 text-center text-gray-500">{player.fouls}</td>
                          </tr>
                      ))}
                      {getTeamPlayers(gameDetails?.homeTeam?.name).length === 0 && (
                          <tr><td colSpan="3" className="p-4 text-center text-gray-400">Loading players...</td></tr>
                      )}
                  </tbody>
              </table>
          </div>

          {/* Away Team Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 uppercase">{gameDetails?.awayTeam?.name || 'Away'} Stats</h3>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">LIVE</span>
              </div>
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                          <th className="px-4 py-2 font-medium">Player</th>
                          <th className="px-4 py-2 text-center font-medium">PTS</th>
                          <th className="px-4 py-2 text-center font-medium">PF</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {getTeamPlayers(gameDetails?.awayTeam?.name).map(player => (
                          <tr key={player._id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-900 flex items-center">
                                  <span className="text-gray-400 w-6 text-xs mr-1">#{player.jerseyNumber}</span>
                                  {player.name}
                              </td>
                              <td className="px-4 py-2 text-center font-bold">{player.points}</td>
                              <td className="px-4 py-2 text-center text-gray-500">{player.fouls}</td>
                          </tr>
                      ))}
                      {getTeamPlayers(gameDetails?.awayTeam?.name).length === 0 && (
                          <tr><td colSpan="3" className="p-4 text-center text-gray-400">Loading players...</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default LiveScoreboard;