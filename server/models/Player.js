import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true },
  position: { 
    type: String, 
    required: true, 
    enum: ['PG', 'SG', 'SF', 'PF', 'C'] 
  },
  
  // Team Registration Info
  jerseyNumber: { type: String, default: '0' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },

  // Stats
  ppg: { type: Number, default: 0 }, // Points
  rpg: { type: Number, default: 0 }, // Rebounds
  apg: { type: Number, default: 0 }, // Assists
  spg: { type: Number, default: 0 }, // Steals
  bpg: { type: Number, default: 0 }, // Blocks
  
  // New Stats for Standings
  turnovers: { type: Number, default: 0 },
  threeMade: { type: Number, default: 0 }, // Three Pointers Made
  ftMade: { type: Number, default: 0 },    // Free Throws Made
  
  // Percentages (Keep existing if used elsewhere)
  fgPerc: { type: Number, default: 0 },
  threePerc: { type: Number, default: 0 },
  
  gamesPlayed: { type: Number, default: 0 },
  
  imageUrl: { type: String, required: true } 
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);