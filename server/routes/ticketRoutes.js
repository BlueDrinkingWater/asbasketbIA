import express from 'express';
import { buyTicket, getUserTickets, getAllTickets } from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/buy', protect, buyTicket);
router.get('/my-tickets', protect, getUserTickets);
router.get('/all', protect, admin, getAllTickets); // NEW

export default router;