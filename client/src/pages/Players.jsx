// client/src/pages/Players.jsx
import React, { useEffect, useState } from 'react';
import { fetchPlayers } from '../services/api';
import { Search, Filter, X, User } from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [sortBy, setSortBy] = useState('ppg');

  // SAFE IMAGE LOADER
  const getPlayerImage = (player) => {
    if (player.imageUrl && !player.imageUrl.includes('placeholder')) {
      return player.imageUrl;
    }
    // Generates an avatar with the player's initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=200`;
  };

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const { data } = await fetchPlayers();
        if (data.success) {
          const enrichedData = data.data.map(p => ({
            ...p,
            fantasyPoints: (
              (p.ppg || 0) * 1 + 
              (p.rpg || 0) * 1.2 + 
              (p.apg || 0) * 1.5 + 
              (p.bpg || 0) * 3 + 
              (p.spg || 0) * 3 - 
              (p.turnovers || 0) * 1
            ).toFixed(1)
          }));
          setPlayers(enrichedData);
          setFilteredPlayers(enrichedData);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };
    getPlayers();
  }, []);

  useEffect(() => {
    let result = players.filter(player =>
      player.name.toLowerCase().includes(search.toLowerCase()) ||
      player.team.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
        const valA = parseFloat(a[sortBy]) || 0;
        const valB = parseFloat(b[sortBy]) || 0;
        return valB - valA;
    });

    setFilteredPlayers(result);
  }, [search, players, sortBy]);

  const getGlobalRank = (player) => {
    const sortedAll = [...players].sort((a,b) => (parseFloat(b[sortBy]) || 0) - (parseFloat(a[sortBy]) || 0));
    return sortedAll.findIndex(p => p._id === player._id) + 1;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">League Players</h1>
          <p className="mt-1 text-gray-500">Click on a player card to view full details</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-orange-500 focus:border-orange-500 shadow-sm"
             >
               <option value="ppg">Rank by Points (PPG)</option>
               <option value="rpg">Rank by Rebounds (RPG)</option>
               <option value="apg">Rank by Assists (APG)</option>
               <option value="fantasyPoints">Rank by Fantasy Points</option>
               <option value="threeMade">Rank by 3PM</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <Filter className="h-4 w-4" />
             </div>
          </div>

          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2"
              placeholder="Search players or teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div 
              key={player._id} 
              onClick={() => setSelectedPlayer(player)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group"
            >
               <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
                 #{getGlobalRank(player)} in {sortBy === 'fantasyPoints' ? 'FP' : sortBy.toUpperCase().replace('MADE', '')}
               </div>

              <div className="aspect-w-16 aspect-h-12 bg-gray-50 relative overflow-hidden">
                 <img
                    src={getPlayerImage(player)}
                    alt={player.name}
                    className="w-full h-56 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    // Prevent infinite loop if UI Avatars also fails
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.style.display = 'none';
                      e.target.parentNode.style.backgroundColor = '#eee';
                    }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                 <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold leading-tight">{player.name}</h3>
                    <p className="text-xs opacity-90">{player.team}</p>
                 </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {player.position}
                   </span>
                   <span className="text-xs text-gray-500 font-mono">#{player.jerseyNumber}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-orange-50 rounded p-2">
                    <p className="text-[10px] text-orange-600 font-bold uppercase">PPG</p>
                    <p className="text-lg font-extrabold text-gray-900">{player.ppg}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">RPG</p>
                    <p className="text-lg font-bold text-gray-900">{player.rpg}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">APG</p>
                    <p className="text-lg font-bold text-gray-900">{player.apg}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedPlayer(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-200">
              <div className="relative h-32 bg-gradient-to-r from-indigo-900 to-blue-800">
                 <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition">
                    <X className="h-6 w-6" />
                 </button>
                 <div className="absolute -bottom-12 left-6 p-1 bg-white rounded-full">
                    <div className="h-24 w-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                        <img src={getPlayerImage(selectedPlayer)} className="h-full w-full object-cover" alt="" />
                    </div>
                 </div>
              </div>

              <div className="pt-14 px-6 pb-6">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedPlayer.name}</h3>
                        <p className="text-sm font-medium text-orange-600">{selectedPlayer.team}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-gray-900">{selectedPlayer.jerseyNumber}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{selectedPlayer.position}</div>
                    </div>
                 </div>

                 <div className="mt-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 border-b pb-2">Season Statistics</h4>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                       <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                          <span className="block text-2xl font-black text-gray-900">{selectedPlayer.ppg}</span>
                          <span className="text-xs text-gray-500 font-semibold uppercase">PTS</span>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                          <span className="block text-2xl font-black text-gray-900">{selectedPlayer.rpg}</span>
                          <span className="text-xs text-gray-500 font-semibold uppercase">REB</span>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
                          <span className="block text-2xl font-black text-gray-900">{selectedPlayer.apg}</span>
                          <span className="text-xs text-gray-500 font-semibold uppercase">AST</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                <button type="button" className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setSelectedPlayer(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;