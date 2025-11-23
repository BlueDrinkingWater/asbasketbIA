import express from 'express';
import { getPlayers, createPlayer, getPlayerById, updatePlayer } from '../controllers/playerController.js';
import { upload } from '../config/cloudinary.js'; // Middleware for image upload
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all players
router.get('/', getPlayers);

// Public: Get single player
router.get('/:id', getPlayerById);

// Admin: Create a player (Requires Image Upload)
router.post('/', protect, admin, upload.single('image'), createPlayer);

// Admin: Update player
router.put('/:id', protect, admin, updatePlayer);

export default router;