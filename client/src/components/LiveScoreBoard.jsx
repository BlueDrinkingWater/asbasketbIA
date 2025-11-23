import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5000"); // Adjust based on env

const LiveScoreboard = ({ gameId, initialData }) => {
  const [timer, setTimer] = useState({ minutes: 12, seconds: 0, shotClock: 24 });
  const [scores, setScores] = useState({ home: 0, away: 0 });

  useEffect(() => {
    if (!gameId) return;

    socket.emit('join_game', gameId);

    // Listen for Timer Updates
    socket.on('receive_timer_update', (data) => {
      setTimer({
        minutes: data.minutes,
        seconds: data.seconds,
        shotClock: data.shotClock
      });
    });

    // Listen for Score Updates
    socket.on('receive_stat_update', (data) => {
      setScores({
        home: data.homeScore,
        away: data.awayScore
      });
    });

    return () => {
      socket.off('receive_timer_update');
      socket.off('receive_stat_update');
    };
  }, [gameId]);

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  return (
    <div className="w-full bg-black text-white p-4 rounded-xl shadow-lg border-2 border-gray-800 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
        Official Live Game
      </div>

      <div className="flex items-center justify-between">
        
        {/* Home Team */}
        <div className="text-center w-1/3">
          <div className="text-4xl font-bold text-orange-500">{scores.home}</div>
          <div className="text-sm font-bold uppercase text-gray-300 mt-1">Home</div>
        </div>

        {/* Clock Centerpiece */}
        <div className="w-1/3 flex flex-col items-center justify-center">
          <div className="text-5xl font-mono font-bold tabular-nums tracking-tight">
            {formatTime(timer.minutes)}:{formatTime(timer.seconds)}
          </div>
          <div className="mt-2 flex gap-4 text-xs font-mono text-gray-400">
            <div className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
              SHOT: <span className="text-yellow-400 text-lg">{timer.shotClock}</span>
            </div>
            <div className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
              QTR: <span className="text-blue-400 text-lg">1</span>
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="text-center w-1/3">
          <div className="text-4xl font-bold text-white">{scores.away}</div>
          <div className="text-sm font-bold uppercase text-gray-300 mt-1">Away</div>
        </div>

      </div>
    </div>
  );
};

export default LiveScoreboard;