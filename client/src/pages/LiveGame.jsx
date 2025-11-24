import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LiveScoreboard from '../components/LiveScoreBoard'; 
import { ArrowLeft, AlertCircle } from 'lucide-react';
import API from '../services/api'; // Import your actual API instance

const LiveGame = () => {
  const { id } = useParams();
  const [gameExists, setGameExists] = useState(null); // null = loading, true = exists, false = error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyGame = async () => {
      try {
        // We assume your backend has a route to get a specific game by ID. 
        // If not, fetchGames() returns all, and we find it.
        const response = await API.get('/games'); 
        const games = response.data.data;
        const game = games.find(g => g._id === id);
        
        if (game) {
          setGameExists(true);
        } else {
          setGameExists(false);
        }
      } catch (error) {
        console.error("Error verifying game:", error);
        setGameExists(false);
      } finally {
        setLoading(false);
      }
    };

    verifyGame();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading Game Data...
      </div>
    );
  }

  if (gameExists === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
        <p className="text-gray-400 mb-6">The game ID you are looking for does not exist or has been removed.</p>
        <Link to="/schedule" className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition">
          Return to Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/schedule" className="inline-flex items-center text-gray-400 hover:text-white transition font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Schedule
          </Link>
        </div>
      </div>
      
      <div className="mt-8">
        {/* Passes the ID to your existing component which handles the socket connection */}
        <LiveScoreboard gameId={id} />
      </div>

      <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Real-Time Data Connection Active</p>
      </div>
    </div>
  );
};

export default LiveGame;