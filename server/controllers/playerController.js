import Player from '../models/Player.js';

// Get all players
export const getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().sort({ ppg: -1 }); 
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
    const body = req.body;

    // Map image if exists
    let imageUrl = '';
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else {
      imageUrl = `https://ui-avatars.com/api/?name=${body.name}&background=random`;
    }

    // Construct player object with all extended stats
    const newPlayer = await Player.create({
      ...body,
      
      // Map Legacy/Duplicate Inputs if necessary (or rely on frontend to send correct keys)
      // Use defaults for numbers to prevent NaN
      ppg: Number(body.ppg) || 0,
      pts: Number(body.pts) || 0,
      
      fgm: Number(body.fgm) || 0,
      fga: Number(body.fga) || 0,
      
      threePm: Number(body.threePm) || Number(body.threeMade) || 0,
      threePa: Number(body.threePa) || 0,
      
      ftm: Number(body.ftm) || Number(body.ftMade) || 0,
      fta: Number(body.fta) || 0,
      
      reb: Number(body.reb) || 0,
      oreb: Number(body.oreb) || 0,
      dreb: Number(body.dreb) || 0,
      rpg: Number(body.rpg) || 0,
      
      ast: Number(body.ast) || 0,
      apg: Number(body.apg) || 0,
      
      stl: Number(body.stl) || 0,
      spg: Number(body.spg) || 0,
      
      blk: Number(body.blk) || 0,
      bpg: Number(body.bpg) || 0,
      
      tov: Number(body.tov) || Number(body.turnovers) || 0,
      turnovers: Number(body.tov) || Number(body.turnovers) || 0, // Keep synced
      
      pf: Number(body.pf) || 0,
      minutes: Number(body.minutes) || 0,
      
      gamesPlayed: Number(body.gamesPlayed) || 0,
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
