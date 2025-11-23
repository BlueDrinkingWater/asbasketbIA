import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true
  },
  conference: {
    type: String,
    required: [true, 'Conference is required'],
    enum: ['East', 'West']
  },
  wins: {
    type: Number,
    default: 0,
    min: 0
  },
  losses: {
    type: Number,
    default: 0,
    min: 0
  },
  logoUrl: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

teamSchema.virtual('winPercentage').get(function() {
  const total = this.wins + this.losses;
  if (total === 0) return 0;
  return (this.wins / total).toFixed(3);
});

export default mongoose.model('Team', teamSchema);