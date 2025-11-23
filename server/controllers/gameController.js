import Game from '../models/Game.js';
import Team from '../models/Teams.js';

export const getGames = async (req, res, next) => {
  try {
    const games = await Game.find()
      .populate('homeTeam', 'name wins losses')
      .populate('awayTeam', 'name wins losses')
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: games });
  } catch (error) {
    next(error);
  }
};

export const createGame = async (req, res, next) => {
  try {
    const { homeTeam, awayTeam, status, homeScore, awayScore } = req.body;

    if (homeTeam === awayTeam) {
      return res.status(400).json({ success: false, message: 'Teams must be different' });
    }

    const game = await Game.create(req.body);

    // Handle Standings
    if (status === 'Final') {
      const hScore = parseInt(homeScore);
      const aScore = parseInt(awayScore);
      
      if (hScore > aScore) {
        await Team.findByIdAndUpdate(homeTeam, { $inc: { wins: 1 } });
        await Team.findByIdAndUpdate(awayTeam, { $inc: { losses: 1 } });
      } else if (aScore > hScore) {
        await Team.findByIdAndUpdate(awayTeam, { $inc: { wins: 1 } });
        await Team.findByIdAndUpdate(homeTeam, { $inc: { losses: 1 } });
      }
    }

    // --- Socket.io Emit ---
    // Get the io instance from app
    const io = req.app.get('io');
    
    // Emit event to all connected clients
    io.emit('game_updated', { message: 'New game added' });
    
    // If standings changed, emit that too
    if (status === 'Final') {
      io.emit('standings_updated', { message: 'Standings changed' });
    }
    // ----------------------

    res.status(201).json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
};