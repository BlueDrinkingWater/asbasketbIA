import express from 'express';
import { buyTicket, getUserTickets } from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js'; // Ensure users are logged in

const router = express.Router();

// Protect these routes so only logged-in users can buy/view tickets
router.post('/buy', protect, buyTicket);
router.get('/', protect, getUserTickets);

export default router;