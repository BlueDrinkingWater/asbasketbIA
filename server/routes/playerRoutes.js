import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPlayers, createPlayer, getPlayerById } from '../controllers/playerController.js';

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'player-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
// Note: 'image' matches the key in FormData on frontend
router.post('/', upload.single('image'), createPlayer);

export default router;