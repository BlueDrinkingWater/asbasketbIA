import Ticket from '../models/Ticket.js';
import Game from '../models/Game.js';

export const buyTicket = async (req, res, next) => {
  try {
    const { gameId, seatNumber, price } = req.body;
    const userId = req.user._id; 

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });

    const existingTicket = await Ticket.findOne({ game: gameId, seatNumber, status: 'confirmed' });
    if (existingTicket) {
      return res.status(400).json({ success: false, message: 'Seat already taken' });
    }

    const ticket = await Ticket.create({
      game: gameId,
      user: userId,
      seatNumber,
      price,
      qrCode: `TICKET-${gameId}-${seatNumber}-${Date.now()}`
    });

    res.status(201).json({ success: true, data: ticket, message: 'Ticket purchased successfully!' });
  } catch (error) {
    next(error);
  }
};

export const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('game', 'homeTeam awayTeam date location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// NEW: Admin Analytics
export const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: 'game',
        populate: { path: 'homeTeam awayTeam', select: 'name' }
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    const revenue = tickets.reduce((acc, t) => acc + t.price, 0);
    
    res.json({ 
      success: true, 
      data: {
        tickets,
        totalRevenue: revenue,
        totalSold: tickets.length
      } 
    });
  } catch (error) {
    next(error);
  }
};