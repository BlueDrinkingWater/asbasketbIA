import express from 'express';
import { createGame, getGames, updateGameStats } from '../controllers/gameController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGames);
router.post('/', protect, admin, createGame);
router.put('/:gameId/stats', protect, admin, updateGameStats);

export default router;