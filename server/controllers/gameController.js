import Game from '../models/Game.js';
import Team from '../models/Teams.js';

// Get Schedule
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

// Create Game & Update Standings
export const createGame = async (req, res, next) => {
  try {
    const { homeTeam, awayTeam, status, homeScore, awayScore } = req.body;

    if (homeTeam === awayTeam) {
      return res.status(400).json({ success: false, message: 'Teams must be different' });
    }

    const game = await Game.create(req.body);

    // AUTOMATIC STANDINGS UPDATE
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

    res.status(201).json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
};