import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  team: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['PG', 'SG', 'SF', 'PF', 'C']
  },
  ppg: {
    type: Number,
    required: [true, 'Points per game is required'],
    min: [0, 'PPG cannot be negative'],
    max: [100, 'PPG cannot exceed 100']
  },
  rpg: {
    type: Number,
    required: [true, 'Rebounds per game is required'],
    min: [0, 'RPG cannot be negative']
  },
  apg: {
    type: Number,
    required: [true, 'Assists per game is required'],
    min: [0, 'APG cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  }
}, { timestamps: true });

playerSchema.index({ name: 1, team: 1 });

export default mongoose.model('Player', playerSchema);