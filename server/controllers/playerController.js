import Player from '../models/Player.js';

// Get all players
export const getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().sort({ ppg: -1 }); // Default sort by points
    res.json({ success: true, data: players });
  } catch (error) {
    next(error);
  }
};

// Get single player
export const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
    res.json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// Create Player (Admin Only)
export const createPlayer = async (req, res, next) => {
  try {
    // Destructure all stat fields including the new ones
    const { 
      name, team, position, jerseyNumber, 
      ppg, rpg, apg, spg, bpg, 
      turnovers, threeMade, ftMade 
    } = req.body;

    // Check if image was uploaded
    let imageUrl = '';
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else {
      // Fallback placeholder if no image provided
      imageUrl = `https://ui-avatars.com/api/?name=${name}&background=random`;
    }

    const newPlayer = await Player.create({
      name,
      team,
      position,
      jerseyNumber,
      ppg: ppg || 0,
      rpg: rpg || 0,
      apg: apg || 0,
      spg: spg || 0,
      bpg: bpg || 0,
      turnovers: turnovers || 0,
      threeMade: threeMade || 0,
      ftMade: ftMade || 0,
      imageUrl
    });

    res.status(201).json({ success: true, data: newPlayer });
  } catch (error) {
    next(error);
  }
};

// Update Player
export const updatePlayer = async (req, res, next) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedPlayer });
  } catch (error) {
    next(error);
  }
};