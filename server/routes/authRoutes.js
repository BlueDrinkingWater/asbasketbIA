import express from 'express';
import { 
  register, 
  login, 
  getAdminDashboardData,
  handleSubscription,
  handleTeamRequest,
  handleStatRequest,
  handleGameRequest,
  submitTeamApplication,
  submitPlayerStats,
  registerForGame
} from '../controllers/authController.js';
import { upload } from '../config/cloudinary.js'; 
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/login', login);
router.post('/register', upload.single('proofOfPayment'), register);

// Subscriber Routes (Protected)
router.post('/submit-team', protect, submitTeamApplication);
router.post('/submit-stats', protect, submitPlayerStats);
router.post('/submit-game', protect, registerForGame);

// Admin Routes
router.get('/admin-data', protect, admin, getAdminDashboardData);
router.put('/admin/subscription', protect, admin, handleSubscription);
router.put('/admin/team-request', protect, admin, handleTeamRequest);
router.put('/admin/stat-request', protect, admin, handleStatRequest);
router.put('/admin/game-request', protect, admin, handleGameRequest);

export default router;