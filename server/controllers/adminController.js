import LeagueSettings from '../models/LeagueSettings.js';

// Get Settings (Public or Protected based on route)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await LeagueSettings.findOne();
    if (!settings) {
      // Auto-create if missing
      settings = await LeagueSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// Update Settings (Admin Only)
export const updateSettings = async (req, res, next) => {
  try {
    const settings = await LeagueSettings.findOneAndUpdate(
      {}, 
      req.body, 
      { new: true, upsert: true } // Update existing or create new
    );
    res.json({ success: true, data: settings, message: 'League settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};