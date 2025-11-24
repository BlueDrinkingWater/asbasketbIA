import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  homeTeam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: [true, 'Home team is required'] 
  },
  awayTeam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: [true, 'Away team is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Game date is required'] 
  },
  location: { type: String, required: [true, 'Location is required'] },
  round: { type: String, default: 'Regular Season' },
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'Final'], 
    default: 'scheduled' 
  },
  
  // --- LIVE GAME DATA ---
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  currentPeriod: { type: Number, default: 1 },
  
  timer: {
    minutes: { type: Number, default: 12 },
    seconds: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
    shotClock: { type: Number, default: 24 }
  },

  // --- ADVANCED PLAY-BY-PLAY ---
  gameEvents: [{
    player: String,
    team: String, // 'home' or 'away'
    action: String, // '3PT_MADE', '2PT_MISS', 'FOUL', 'REB'
    description: String, // "LeBron James makes 26-foot step back jumper"
    coordinateX: Number, // 0-100 (Court horizontal position)
    coordinateY: Number, // 0-100 (Court vertical position)
    timestamp: { type: Date, default: Date.now },
    period: { type: Number, default: 1 },
    clock: { type: String, default: '12:00' }
  }],
  
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);