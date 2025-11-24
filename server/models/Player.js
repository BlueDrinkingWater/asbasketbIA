import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  team: { type: String, required: true, trim: true }, // Migrate to ObjectId ref 'Team' in future
  position: { 
    type: String, 
    required: true, 
    enum: ['PG', 'SG', 'SF', 'PF', 'C'] 
  },
  
  // --- Profile ---
  jerseyNumber: { type: String, default: '0' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  height: { type: String, default: '' }, 
  weight: { type: Number, default: 0 },
  country: { type: String, default: 'USA' },
  draftYear: { type: Number },
  
  // --- Detailed Box Score Stats (Season Totals/Averages) ---
  
  // Scoring
  pts: { type: Number, default: 0 }, // Total Points
  ppg: { type: Number, default: 0 }, // Points Per Game (Calculated or Manual)
  
  fgm: { type: Number, default: 0 }, // Field Goals Made
  fga: { type: Number, default: 0 }, // Field Goals Attempted
  // fgPerc is calculated below via virtual if not set manually
  
  threePm: { type: Number, default: 0 }, // 3PT Made
  threePa: { type: Number, default: 0 }, // 3PT Attempted
  // threePerc is calculated below
  
  ftm: { type: Number, default: 0 }, // Free Throws Made
  fta: { type: Number, default: 0 }, // Free Throws Attempted
  // ftPerc is calculated below

  // Rebounding
  oreb: { type: Number, default: 0 }, // Offensive Rebounds
  dreb: { type: Number, default: 0 }, // Defensive Rebounds
  reb: { type: Number, default: 0 },  // Total Rebounds (or rpg)
  rpg: { type: Number, default: 0 },

  // Playmaking
  ast: { type: Number, default: 0 }, // Total Assists
  apg: { type: Number, default: 0 },
  
  // Defense
  stl: { type: Number, default: 0 }, // Total Steals
  spg: { type: Number, default: 0 },
  blk: { type: Number, default: 0 }, // Total Blocks
  bpg: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },  // Personal Fouls

  // Ball Handling
  tov: { type: Number, default: 0 }, // Turnovers
  
  // Playing Time
  minutes: { type: Number, default: 0 }, // Total Minutes
  
  // Legacy Fields (to avoid breaking existing code)
  turnovers: { type: Number, default: 0 }, // Mapped to tov in UI
  threeMade: { type: Number, default: 0 }, // Mapped to threePm
  ftMade: { type: Number, default: 0 },    // Mapped to ftm
  
  gamesPlayed: { type: Number, default: 0 },
  
  imageUrl: { type: String, required: true } 
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- Virtuals for Percentages ---
playerSchema.virtual('calculatedFgPct').get(function() {
  if (this.fga === 0) return '0.0';
  return ((this.fgm / this.fga) * 100).toFixed(1);
});

playerSchema.virtual('calculatedThreePct').get(function() {
  if (this.threePa === 0) return '0.0';
  return ((this.threePm / this.threePa) * 100).toFixed(1);
});

playerSchema.virtual('calculatedFtPct').get(function() {
  if (this.fta === 0) return '0.0';
  return ((this.ftm / this.fta) * 100).toFixed(1);
});

// --- Virtual for Assist-to-Turnover Ratio ---
playerSchema.virtual('astToTov').get(function() {
  if (this.tov === 0) return this.ast.toFixed(2); // Return string for consistency
  return (this.ast / this.tov).toFixed(2);
});

export default mongoose.model('Player', playerSchema);