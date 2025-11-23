import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Ensure these functions exist in your authController, or comment these lines out temporarily
router.post('/register', register);
router.post('/login', login);

export default router;