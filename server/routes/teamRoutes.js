import express from 'express';
import { getTeams, createTeam } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTeams);
router.post('/', protect, admin, createTeam);

export default router;