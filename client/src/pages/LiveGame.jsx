import React from 'react';
import { useParams, Link } from 'react-router-dom';
import LiveScoreboard from '../components/LiveScoreboard'; // Ensure you created this component from previous steps
import { ArrowLeft } from 'lucide-react';

const LiveGame = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/schedule" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Schedule
        </Link>
        
        {/* The Real-Time Component */}
        <LiveScoreboard gameId={id} />

        <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Scores update automatically in real-time.</p>
            <p>Powered by AsBasketBIA WebSocket Engine</p>
        </div>
      </div>
    </div>
  );
};

export default LiveGame;