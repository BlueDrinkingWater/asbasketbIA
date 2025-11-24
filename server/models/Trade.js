import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  proposingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  receivingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  
  // Players leaving the proposing team
  assetsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  
  // Players leaving the receiving team
  assetsRequested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined', 'Vetoed'],
    default: 'Pending'
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Trade', tradeSchema);