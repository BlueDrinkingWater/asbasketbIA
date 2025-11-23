import express from 'express';
import { getPlayers, createPlayer, getPlayerById } from '../controllers/playerController.js';

const router = express.Router();

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.post('/', createPlayer);

export default router;