import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Requires Auth Module
  seatNumber: { type: String, required: true }, // e.g., "A12"
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'used'], 
    default: 'confirmed' 
  },
  qrCode: { type: String } // This would store a generated hash/string
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);