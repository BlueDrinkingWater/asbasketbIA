import mongoose from 'mongoose';

const statLineSchema = new mongoose.Schema({
  player: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Player', 
    required: [true, 'Player ID is required'] 
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: [true, 'Team ID is required'] 
  },
  game: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game', 
    required: [true, 'Game ID is required'] 
  },
  
  // Core Stats
  minutes: { type: Number, default: 0 },
  points: { type: Number, default: 0, min: 0 },
  rebounds: { type: Number, default: 0, min: 0 },
  assists: { type: Number, default: 0, min: 0 },
  steals: { type: Number, default: 0, min: 0 },
  blocks: { type: Number, default: 0, min: 0 },
  turnovers: { type: Number, default: 0, min: 0 },
  fouls: { type: Number, default: 0, min: 0 },
  
  // Shooting Splits
  fgMade: { type: Number, default: 0 },
  fgAttempted: { type: Number, default: 0 },
  threeMade: { type: Number, default: 0 },
  threeAttempted: { type: Number, default: 0 },
  ftMade: { type: Number, default: 0 },
  ftAttempted: { type: Number, default: 0 },

  // Advanced (Calculated on save or retrieval)
  plusMinus: { type: Number, default: 0 },
  fantasyPoints: { type: Number, default: 0 }

}, { timestamps: true });

// Virtual for Field Goal Percentage
statLineSchema.virtual('fgPct').get(function() {
  if (this.fgAttempted === 0) return 0;
  return (this.fgMade / this.fgAttempted * 100).toFixed(1);
});

export default mongoose.model('StatLine', statLineSchema);