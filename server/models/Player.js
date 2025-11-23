import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true },
  position: { 
    type: String, 
    required: true, 
    enum: ['PG', 'SG', 'SF', 'PF', 'C'] 
  },
  // Stats
  ppg: { type: Number, default: 0 }, // Points
  rpg: { type: Number, default: 0 }, // Rebounds
  apg: { type: Number, default: 0 }, // Assists
  spg: { type: Number, default: 0 }, // Steals
  bpg: { type: Number, default: 0 }, // Blocks
  fgPerc: { type: Number, default: 0 }, // Field Goal %
  threePerc: { type: Number, default: 0 }, // 3-Point %
  gamesPlayed: { type: Number, default: 0 },
  
  imageUrl: { type: String, required: true } // Stores the path to the file
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);