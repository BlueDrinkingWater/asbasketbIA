import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  contactNumber: { type: String },
  
  // Subscription / Application Status
  subscriptionStatus: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'inactive'], 
    default: 'inactive' 
  },
  subscriptionExpiresAt: { type: Date },
  
  paymentProofUrl: { type: String }, // URL from Cloudinary

  // Pending Team Application Data (Stores data here until Admin approves)
  teamRegistration: {
    isApplicant: { type: Boolean, default: false },
    teamName: { type: String },
    conference: { type: String, enum: ['East', 'West'] },
    roster: [{
      name: String,
      gender: String,
      jerseyNumber: String,
      position: String
    }]
  }
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