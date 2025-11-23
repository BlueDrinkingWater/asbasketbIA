import Team from '../models/Teams.js';

// RENAMED from getStandings to getTeams to match the route import
export const getTeams = async (req, res, next) => {
  try {
    // Sort by wins descending (highest wins first)
    // We can also sort by winPercentage virtually if we do it in JS, 
    // but standard wins sorting is fine for DB query
    const teams = await Team.find().sort({ wins: -1, losses: 1 });
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);

    // --- SOCKET.IO: Emit Update ---
    const io = req.app.get('io');
    if (io) {
      // Notify clients to refresh standings
      io.emit('standings_updated', { message: 'New team created' });
    }
    // -----------------------------

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};