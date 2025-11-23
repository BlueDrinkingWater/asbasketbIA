import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if subscription is active
export const checkSubscription = async (req, res, next) => {
  if (req.user.role === 'admin') return next(); // Admins bypass checks

  if (req.user.subscriptionStatus !== 'active') {
    return res.status(403).json({ message: 'Subscription required. Please renew.' });
  }

  // Automatic Expiration Check
  if (req.user.subscriptionExpiresAt && new Date() > new Date(req.user.subscriptionExpiresAt)) {
    req.user.subscriptionStatus = 'expired';
    await req.user.save();
    return res.status(403).json({ message: 'Subscription expired. Please upload new payment.' });
  }

  next();
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};