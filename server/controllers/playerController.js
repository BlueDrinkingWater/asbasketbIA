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
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Create full URL for the image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const player = await Player.create({
      ...req.body,
      imageUrl: imageUrl
    });

    // --- SOCKET.IO: Emit Event ---
    const io = req.app.get('io');
    if (io) {
      io.emit('players_updated', { message: 'New player created' });
    }
    // -----------------------------

    res.status(201).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      const error = new Error('Player not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};