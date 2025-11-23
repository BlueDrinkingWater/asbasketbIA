import express from 'express';
import { getTeams, createTeam } from '../controllers/teamController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all teams
router.get('/', getTeams);

// Admin: Create a team
router.post('/', protect, admin, createTeam);

export default router;