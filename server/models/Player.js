import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true },
  position: { 
    type: String, 
    required: true, 
    enum: ['PG', 'SG', 'SF', 'PF', 'C'] 
  },
  
  // NEW FIELDS for Team Registration
  jerseyNumber: { type: String, default: '0' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },

  // Stats
  ppg: { type: Number, default: 0 },
  rpg: { type: Number, default: 0 },
  apg: { type: Number, default: 0 },
  spg: { type: Number, default: 0 },
  bpg: { type: Number, default: 0 },
  fgPerc: { type: Number, default: 0 },
  threePerc: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  
  imageUrl: { type: String, required: true } 
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);