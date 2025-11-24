// server/models/LeagueSettings.js
import mongoose from 'mongoose';

const leagueSettingsSchema = new mongoose.Schema({
  seasonName: { type: String, default: '2024-2025 Season' },
  currentRound: { type: String, default: 'Regular Season' },
  
  // Switches
  isTradeDeadlinePassed: { type: Boolean, default: false },
  isMaintenanceMode: { type: Boolean, default: false },
  allowNewRegistrations: { type: Boolean, default: true },
  
  // League Info & Home Page Content
  commissionerMessage: { type: String, default: 'Welcome to the league!' },
  rulesUrl: { type: String },
  liveStreamUrl: { type: String, default: '' } // NEW: Link for live game on home page
  
}, { timestamps: true });

export default mongoose.model('LeagueSettings', leagueSettingsSchema);