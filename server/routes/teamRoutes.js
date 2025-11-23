import express from 'express';
import { getStandings, createTeam } from '../controllers/teamController.js';

const router = express.Router();

router.get('/', getStandings);
router.post('/', createTeam);

export default router;