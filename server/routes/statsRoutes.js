import express from 'express';
import { createStatLine, getLeaders, getPlayerGameLog } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, createStatLine);
router.get('/leaders', getLeaders);
router.get('/log/:playerId', getPlayerGameLog);

export default router;