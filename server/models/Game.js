import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled' },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // For "Sign up for games"
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);