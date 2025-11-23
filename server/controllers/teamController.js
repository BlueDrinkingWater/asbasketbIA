import Team from '../models/Team.js';

export const getStandings = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ wins: -1 });
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};