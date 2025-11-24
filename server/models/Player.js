import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // Kept as String to preserve current functionality, but recommend migrating to ObjectId ref 'Team' later
  team: { type: String, required: true, trim: true }, 
  position: { 
    type: String, 
    required: true, 
    enum: ['PG', 'SG', 'SF', 'PF', 'C'] 
  },
  
  // --- NBA Style Profile Info ---
  jerseyNumber: { type: String, default: '0' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  height: { type: String, default: '' }, // e.g. "6'8""
  weight: { type: Number, default: 0 },  // e.g. 250 lbs
  country: { type: String, default: 'USA' },
  draftYear: { type: Number },
  
  // --- Season Stats ---
  ppg: { type: Number, default: 0 },
  rpg: { type: Number, default: 0 },
  apg: { type: Number, default: 0 },
  spg: { type: Number, default: 0 },
  bpg: { type: Number, default: 0 },
  
  turnovers: { type: Number, default: 0 },
  threeMade: { type: Number, default: 0 },
  ftMade: { type: Number, default: 0 },
  
  fgPerc: { type: Number, default: 0 },
  threePerc: { type: Number, default: 0 },
  
  gamesPlayed: { type: Number, default: 0 },
  
  imageUrl: { type: String, required: true } 
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);