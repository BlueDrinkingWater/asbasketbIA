import StatLine from '../models/StatLine.js';
import Player from '../models/Player.js';

// Submit stats for a specific game
export const createStatLine = async (req, res, next) => {
  try {
    const { player, game, points, rebounds, assists } = req.body;

    // 1. Check if stat line already exists for this player+game
    const existing = await StatLine.findOne({ player, game });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Stats for this player in this game already exist.' });
    }

    // 2. Create the StatLine
    const statLine = await StatLine.create(req.body);

    // 3. Optional: Trigger an update to the main Player profile averages
    // This is a simplified aggregation to update the "cache" on the Player model
    const stats = await StatLine.find({ player });
    const totalGames = stats.length;
    const totalPoints = stats.reduce((acc, curr) => acc + curr.points, 0);
    
    await Player.findByIdAndUpdate(player, {
      ppg: (totalPoints / totalGames).toFixed(1),
      gamesPlayed: totalGames
    });

    res.status(201).json({ success: true, data: statLine });
  } catch (error) {
    next(error);
  }
};

// Get Leaderboard (Season Highs)
export const getLeaders = async (req, res, next) => {
  try {
    const category = req.query.category || 'points'; // Default to points
    const limit = parseInt(req.query.limit) || 10;

    const leaders = await StatLine.find()
      .sort({ [category]: -1 })
      .limit(limit)
      .populate('player', 'name imageUrl position')
      .populate('team', 'name logoUrl');

    res.json({ success: true, data: leaders });
  } catch (error) {
    next(error);
  }
};

// Get Player's Game Log
export const getPlayerGameLog = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const logs = await StatLine.find({ player: playerId })
      .populate('game', 'date homeTeam awayTeam homeScore awayScore')
      .sort({ 'createdAt': -1 }); // Most recent games first

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};