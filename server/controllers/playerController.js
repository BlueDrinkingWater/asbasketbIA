import Player from '../models/Player.js';

export const getPlayers = async (req, res, next) => {
  try {
    const { search, position, team, page = 1, limit = 12 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { team: { $regex: search, $options: 'i' } }
      ];
    }
    if (position) query.position = position;
    if (team) query.team = { $regex: team, $options: 'i' };

    // Sort by PPG descending to show best players first
    const players = await Player.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ ppg: -1 });

    const total = await Player.countDocuments(query);

    res.status(200).json({
      success: true,
      data: players,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a player photo' });
    }

    // FIX: Use Cloudinary's secure_url from req.file.path
    // The previous code tried to build a local URL which won't work with Cloudinary
    const player = await Player.create({
      ...req.body,
      imageUrl: req.file.path 
    });

    // --- Socket.io Emit ---
    // Update the public leaderboard immediately
    const io = req.app.get('io');
    io.emit('players_updated', { message: 'New player stats added' });
    // ----------------------

    res.status(201).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      res.status(404);
      throw new Error('Player not found');
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};