import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Assuming route is /game/:id/console
import api from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const socket = io("http://localhost:5000"); // Adjust URL if deployed

const OfficialConsole = () => {
  // Use gameId from URL params
  // For testing, you might temporarily hardcode or pass via props
  // const { id: gameId } = useParams(); 
  const [gameId, setGameId] = useState(null); // Add logic to select game if no param
  
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- TIMER STATE ---
  const [minutes, setMinutes] = useState(12);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [shotClock, setShotClock] = useState(24);
  const [period, setPeriod] = useState(1);

  // --- SCORE STATE ---
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Refs for intervals
  const timerRef = useRef(null);

  // 1. Initial Load & Socket Join
  useEffect(() => {
    // Mock fetching game details - replace with actual API call
    const fetchGame = async () => {
      try {
        // const { data } = await api.get(`/games/${gameId}`);
        // setGameData(data);
        // setHomeScore(data.homeScore);
        // setAwayScore(data.awayScore);
        
        // MOCK DATA FOR DISPLAY
        setGameData({
          _id: "mock_game_id",
          homeTeam: { name: "Lakers", roster: [{_id:1, name:"James"}, {_id:2, name:"Davis"}] },
          awayTeam: { name: "Warriors", roster: [{_id:3, name:"Curry"}, {_id:4, name:"Green"}] }
        });
        setGameId("mock_game_id");
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load game data");
        setLoading(false);
      }
    };

    fetchGame();
  }, []);

  useEffect(() => {
    if (gameId) {
      socket.emit('join_game', gameId);
    }
  }, [gameId]);

  // 2. Timer Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec === 0) {
            if (minutes === 0) {
              setIsRunning(false);
              clearInterval(timerRef.current);
              return 0;
            }
            setMinutes((prevMin) => prevMin - 1);
            return 59;
          }
          return prevSec - 1;
        });

        // Separate Shot Clock Logic
        setShotClock((prev) => (prev > 0 ? prev - 1 : 0));

      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, minutes]);

  // 3. Broadcast Timer changes via Socket
  useEffect(() => {
    if (gameId) {
      socket.emit('timer_update', {
        gameId,
        minutes,
        seconds,
        isRunning,
        shotClock
      });
    }
  }, [minutes, seconds, isRunning, shotClock, gameId]);

  // --- HANDLERS ---

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetShotClock = (val) => setShotClock(val);

  const handleScoreUpdate = (team, points) => {
    let newHome = homeScore;
    let newAway = awayScore;

    if (team === 'home') {
      newHome += points;
      setHomeScore(newHome);
    } else {
      newAway += points;
      setAwayScore(newAway);
    }

    // Send to DB (Optimistic UI update)
    // api.put(`/games/${gameId}/score`, { homeScore: newHome, awayScore: newAway });

    // Emit Socket Event
    socket.emit('stat_update', {
      gameId,
      homeScore: newHome,
      awayScore: newAway,
      action: `${points}PT basket`
    });
  };

  const formatTime = (num) => (num < 10 ? `0${num}` : num);

  if (loading) return <div className="p-10 text-center">Loading Console...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CENTER: TIMER CONTROL */}
        <div className="lg:col-span-3 bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl flex flex-col items-center justify-center">
          <h2 className="text-gray-400 uppercase text-sm tracking-widest mb-2">Official Game Clock</h2>
          
          {/* Main Clock Display */}
          <div className={`text-9xl font-mono font-bold tabular-nums mb-4 ${minutes === 0 && seconds < 60 ? 'text-red-500' : 'text-orange-500'}`}>
            {formatTime(minutes)}:{formatTime(seconds)}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={toggleTimer}
              className={`flex items-center px-8 py-4 rounded-lg font-bold text-xl transition-colors ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isRunning ? <><Pause className="mr-2" /> STOP</> : <><Play className="mr-2" /> START</>}
            </button>
            
            <button onClick={() => {setMinutes(12); setSeconds(0); setIsRunning(false);}} className="bg-gray-700 hover:bg-gray-600 px-6 rounded-lg">
              <RotateCcw />
            </button>
          </div>

          {/* Sub Controls */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
            <div className="bg-black rounded-lg p-4 text-center border border-gray-600">
              <div className="text-gray-400 text-xs mb-1">SHOT CLOCK</div>
              <div className="text-5xl font-mono text-yellow-400 mb-2">{shotClock}</div>
              <div className="flex justify-center gap-2">
                <button onClick={() => resetShotClock(24)} className="bg-gray-700 px-3 py-1 text-xs rounded">24s</button>
                <button onClick={() => resetShotClock(14)} className="bg-gray-700 px-3 py-1 text-xs rounded">14s</button>
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 text-center border border-gray-600">
              <div className="text-gray-400 text-xs mb-1">PERIOD</div>
              <div className="text-5xl font-mono text-blue-400 mb-2">{period}</div>
              <div className="flex justify-center gap-2">
                <button onClick={() => setPeriod(p => Math.max(1, p-1))} className="bg-gray-700 px-3 py-1 text-xs rounded">-</button>
                <button onClick={() => setPeriod(p => Math.min(4, p+1))} className="bg-gray-700 px-3 py-1 text-xs rounded">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT: HOME TEAM */}
        <div className="bg-white rounded-xl p-4 text-gray-900 lg:col-span-1.5">
          <div className="flex justify-between items-end border-b-4 border-orange-600 pb-2 mb-4">
            <h3 className="text-2xl font-bold">{gameData?.homeTeam.name}</h3>
            <span className="text-5xl font-bold">{homeScore}</span>
          </div>
          <div className="space-y-2">
            {/* Quick Team Actions */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => handleScoreUpdate('home', 1)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+1</button>
              <button onClick={() => handleScoreUpdate('home', 2)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+2</button>
              <button onClick={() => handleScoreUpdate('home', 3)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+3</button>
            </div>
            
            <h4 className="text-xs font-bold text-gray-500 uppercase">Players on Floor</h4>
            {gameData?.homeTeam.roster.map(player => (
              <div key={player._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-medium">{player.name}</span>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Foul</button>
                  <button className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">Pts</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AWAY TEAM */}
        <div className="bg-white rounded-xl p-4 text-gray-900 lg:col-span-1.5">
          <div className="flex justify-between items-end border-b-4 border-blue-600 pb-2 mb-4">
            <h3 className="text-2xl font-bold">{gameData?.awayTeam.name}</h3>
            <span className="text-5xl font-bold">{awayScore}</span>
          </div>
          <div className="space-y-2">
             <div className="flex gap-2 mb-4">
              <button onClick={() => handleScoreUpdate('away', 1)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+1</button>
              <button onClick={() => handleScoreUpdate('away', 2)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+2</button>
              <button onClick={() => handleScoreUpdate('away', 3)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded text-sm font-bold">+3</button>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase">Players on Floor</h4>
            {gameData?.awayTeam.roster.map(player => (
              <div key={player._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-medium">{player.name}</span>
                <div className="flex gap-1">
                  <button className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">Foul</button>
                  <button className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">Pts</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficialConsole;