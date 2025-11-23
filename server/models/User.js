import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  contactNumber: { type: String },
  
  // Subscription Status
  subscriptionStatus: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'inactive'], 
    default: 'inactive' 
  },
  subscriptionExpiresAt: { type: Date },
  paymentProofUrl: { type: String },

  // 1. Team Registration (Pending Admin Approval)
  teamRegistration: {
    isApplicant: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
    teamName: { type: String },
    conference: { type: String, enum: ['East', 'West'] },
    roster: [{
      name: String,
      gender: String,
      jerseyNumber: String,
      position: String
    }]
  },

  // 2. Player Stat Requests (Pending Admin Approval)
  statRequests: [{
    playerName: { type: String, required: true },
    gameDate: { type: Date },
    stats: {
      ppg: Number,
      rpg: Number,
      apg: Number,
      spg: Number,
      bpg: Number
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    dateSubmitted: { type: Date, default: Date.now }
  }],

  // 3. Game Registration Requests (Pending Admin Approval)
  gameRequests: [{
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    teamName: { type: String }, // The team they are registering for this game
    roster: [{
      name: String,
      jerseyNumber: String,
      position: String
    }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    dateSubmitted: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);