import express from 'express';
import { register, login, getUsers, updateUserStatus } from '../controllers/authController.js';
import { upload } from '../config/cloudinary.js'; // Import configured multer
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/login', login);

// Register requires file upload handling ('proofOfPayment' matches frontend form data name)
router.post('/register', upload.single('proofOfPayment'), register);

// Admin Routes
router.get('/users', protect, admin, getUsers);
router.put('/status', protect, admin, updateUserStatus);

export default router;