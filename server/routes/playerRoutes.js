import express from 'express';
import { createPlayer, getPlayers } from '../controllers/playerController.js';
import { protect, admin } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js'; // Reusing your existing upload config

const router = express.Router();

router.get('/', getPlayers);
router.post('/', protect, admin, upload.single('photo'), createPlayer);

export default router;