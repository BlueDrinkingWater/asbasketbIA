import express from 'express';
import { proposeTrade, executeTrade } from '../controllers/tradeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Trades usually require Admin approval or GM access
router.post('/propose', protect, proposeTrade); 
router.post('/execute', protect, admin, executeTrade);

export default router;