import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User with Payment Proof
export const register = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Get Cloudinary URL from req.file (provided by multer middleware)
    const paymentProofUrl = req.file ? req.file.path : null;

    if (!paymentProofUrl) {
      return res.status(400).json({ success: false, message: 'Payment proof is required' });
    }

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      paymentProofUrl,
      subscriptionStatus: 'pending' // Waits for admin approval
    });
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// --- ADMIN FUNCTIONS ---

// Get all users (for admin dashboard)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Approve Payment (Sets logic for 30 days)
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body; // status should be 'active' or 'rejected'
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscriptionStatus = status;

    if (status === 'active') {
      // Set expiration to 30 days from NOW
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      user.subscriptionExpiresAt = expiryDate;
    } else {
      user.subscriptionExpiresAt = null;
    }

    await user.save();

    res.json({ success: true, message: `User updated to ${status}`, data: user });
  } catch (error) {
    next(error);
  }
};