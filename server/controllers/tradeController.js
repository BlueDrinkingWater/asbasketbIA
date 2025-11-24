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

    res.status(201).json({ success: true, data: trade, message: 'Trade proposal submitted to league office.' });
  } catch (error) {
    next(error);
  }
};

export const executeTrade = async (req, res, next) => {
  try {
    const { tradeId, action } = req.body; // action = 'Approved' or 'Declined'
    const trade = await Trade.findById(tradeId);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (action === 'Approved') {
      // 1. Move Offered Players to Receiving Team
      if (trade.assetsOffered.length > 0) {
        await Player.updateMany(
          { _id: { $in: trade.assetsOffered } },
          { team: trade.receivingTeam }
        );
      }

      // 2. Move Requested Players to Proposing Team
      if (trade.assetsRequested.length > 0) {
        await Player.updateMany(
          { _id: { $in: trade.assetsRequested } },
          { team: trade.proposingTeam }
        );
      }
      trade.status = 'Approved';
    } else {
      trade.status = action;
    }

    await trade.save();
    res.json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};