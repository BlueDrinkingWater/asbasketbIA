import Team from '../models/Teams.js';

export const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ wins: -1 });
    res.json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const { name, conference, logoUrl } = req.body;

    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ success: false, message: 'Team already exists' });
    }

    const team = await Team.create({
      name,
      conference,
      logoUrl: logoUrl || `https://ui-avatars.com/api/?name=${name}&background=random`
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};