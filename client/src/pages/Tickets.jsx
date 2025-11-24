import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Tag, MapPin, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Tickets = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch upcoming games only
    API.get('/games')
      .then(res => {
        const upcoming = res.data.data.filter(g => g.status === 'scheduled');
        setGames(upcoming);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const handleBuyTicket = async (gameId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error("Please login to buy tickets");
        window.location.href = "/login";
        return;
    }

    try {
        // Placeholder for payment logic
        const seat = prompt("Enter Seat Number (e.g. A1):");
        if(!seat) return;

        await API.post('/tickets/buy', {
            gameId,
            seatNumber: seat,
            price: 25.00 // Standard Price
        });
        toast.success(`Ticket for seat ${seat} purchased! Check your dashboard.`);
    } catch (error) {
        toast.error(error.response?.data?.message || "Purchase failed");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading Tickets...</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Box Office</h1>
        <p className="text-gray-400 mb-8">Secure your seats for the upcoming action.</p>

        <div className="space-y-4">
          {games.length > 0 ? games.map(game => (
            <div key={game._id} className="bg-white rounded-lg p-6 flex flex-col md:flex-row items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <div className="text-center w-20">
                    <span className="block text-xs text-gray-500 font-bold uppercase">{new Date(game.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="block text-2xl font-black text-gray-800">{new Date(game.date).getDate()}</span>
                </div>
                <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {game.homeTeam?.name || 'Home'} <span className="text-gray-400 text-sm">vs</span> {game.awayTeam?.name || 'Away'}
                    </h3>
                    <div className="flex text-sm text-gray-500 gap-4 mt-1">
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {new Date(game.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {game.location}</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-400">Starting at</p>
                    <p className="font-bold text-lg text-green-600">$25.00</p>
                </div>
                <button 
                    onClick={() => handleBuyTicket(game._id)}
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center transition shadow-lg shadow-indigo-500/30">
                    <CreditCard className="w-4 h-4 mr-2"/> Buy Ticket
                </button>
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-center py-12 bg-gray-800 rounded-lg">No tickets available at this time.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;