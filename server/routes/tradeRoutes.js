import express from 'express';
import { proposeTrade, executeTrade, getTrades } from '../controllers/tradeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/propose', protect, proposeTrade); 
router.get('/', protect, admin, getTrades); // NEW
router.post('/execute', protect, admin, executeTrade);

export default router;