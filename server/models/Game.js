// server/models/Game.js
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
  location: { 
    type: String, 
    required: [true, 'Location is required'] 
  },
  // New field to categorize games (e.g., "Preliminary", "Semi-Final", "Finals")
  round: {
    type: String,
    default: 'Regular Season'
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'Final'], 
    default: 'scheduled' 
  },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);