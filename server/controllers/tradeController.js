import Trade from '../models/Trade.js';
import Player from '../models/Player.js';

export const proposeTrade = async (req, res, next) => {
  try {
    const { proposingTeam, receivingTeam, assetsOffered, assetsRequested } = req.body;
    
    const trade = await Trade.create({
      proposingTeam,
      receivingTeam,
      assetsOffered,
      assetsRequested
    });

    res.status(201).json({ success: true, data: trade, message: 'Trade proposal submitted.' });
  } catch (error) {
    next(error);
  }
};

// NEW: Get all trades for Admin
export const getTrades = async (req, res, next) => {
  try {
    const trades = await Trade.find()
      .populate('proposingTeam', 'name logoUrl')
      .populate('receivingTeam', 'name logoUrl')
      .populate('assetsOffered', 'name position')
      .populate('assetsRequested', 'name position')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: trades });
  } catch (error) {
    next(error);
  }
};

export const executeTrade = async (req, res, next) => {
  try {
    const { tradeId, action } = req.body; // 'Approved' or 'Declined'
    const trade = await Trade.findById(tradeId);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'Pending') return res.status(400).json({ message: 'Trade already resolved' });

    if (action === 'Approved') {
      // 1. Move Offered Players to Receiving Team
      if (trade.assetsOffered && trade.assetsOffered.length > 0) {
        await Player.updateMany(
          { _id: { $in: trade.assetsOffered } },
          { team: trade.receivingTeam }
        );
      }

      // 2. Move Requested Players to Proposing Team
      if (trade.assetsRequested && trade.assetsRequested.length > 0) {
        await Player.updateMany(
          { _id: { $in: trade.assetsRequested } },
          { team: trade.proposingTeam }
        );
      }
      trade.status = 'Approved';
    } else {
      trade.status = action; // Declined or Vetoed
    }

    await trade.save();
    res.json({ success: true, data: trade, message: `Trade ${action}` });
  } catch (error) {
    next(error);
  }
};