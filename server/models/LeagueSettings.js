import mongoose from 'mongoose';

const leagueSettingsSchema = new mongoose.Schema({
  seasonName: { type: String, default: '2024-2025 Season' },
  currentRound: { type: String, default: 'Regular Season' },
  
  // Switches
  isTradeDeadlinePassed: { type: Boolean, default: false },
  isMaintenanceMode: { type: Boolean, default: false },
  allowNewRegistrations: { type: Boolean, default: true },
  
  // League Info
  commissionerMessage: { type: String, default: 'Welcome to the league!' },
  rulesUrl: { type: String }
  
}, { timestamps: true });

// Singleton pattern ensures only one settings document exists usually
export default mongoose.model('LeagueSettings', leagueSettingsSchema);