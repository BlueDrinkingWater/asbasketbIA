import express from 'express';
import { getSettings, updateSettings } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', getSettings);
router.put('/settings', protect, admin, updateSettings);

export default router;