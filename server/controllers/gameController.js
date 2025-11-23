import Game from '../models/Game.js';
import Team from '../models/Teams.js';

// Helper to update team standings based on score
const updateStandings = async (homeTeamId, awayTeamId, homeScore, awayScore) => {
  const hScore = parseInt(homeScore);
  const aScore = parseInt(awayScore);

  if (hScore > aScore) {
    // Home wins
    await Team.findByIdAndUpdate(homeTeamId, { $inc: { wins: 1 } });
    await Team.findByIdAndUpdate(awayTeamId, { $inc: { losses: 1 } });
  } else if (aScore > hScore) {
    // Away wins
    await Team.findByIdAndUpdate(awayTeamId, { $inc: { wins: 1 } });
    await Team.findByIdAndUpdate(homeTeamId, { $inc: { losses: 1 } });
  }
};

export const getGames = async (req, res, next) => {
  try {
    const games = await Game.find()
      .populate('homeTeam', 'name logoUrl wins losses')
      .populate('awayTeam', 'name logoUrl wins losses')
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

    // If creating a game that is ALREADY final, update standings immediately
    if (status === 'Final') {
      await updateStandings(homeTeam, awayTeam, homeScore, awayScore);
    }

    // Emit event
    const io = req.app.get('io');
    if (io) {
      io.emit('game_updated', { message: 'New game scheduled' });
      if (status === 'Final') io.emit('standings_updated');
    }

    res.status(201).json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
};

// *** THIS WAS MISSING AND CAUSED THE CRASH ***
export const updateGameStats = async (req, res, next) => {
  try {
    const { status, homeScore, awayScore } = req.body;
    const game = await Game.findById(req.params.gameId);

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Update game details
    const updatedGame = await Game.findByIdAndUpdate(
      req.params.gameId,
      req.body,
      { new: true }
    );

    // If status changed to Final from something else, update team records
    if (game.status !== 'Final' && status === 'Final') {
      await updateStandings(game.homeTeam, game.awayTeam, homeScore, awayScore);
      
      // Notify public page to refresh standings
      const io = req.app.get('io');
      if (io) io.emit('standings_updated');
    }

    // Notify public page to refresh schedule
    const io = req.app.get('io');
    if (io) io.emit('game_updated');

    res.status(200).json({ success: true, data: updatedGame });
  } catch (error) {
    next(error);
  }
};