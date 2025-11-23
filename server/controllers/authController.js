import User from '../models/User.js';
import Team from '../models/Teams.js';
import Player from '../models/Player.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User with Payment Proof & Optional Team Application
export const register = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, isTeamApplication, teamName, conference, roster } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Get Cloudinary URL
    const paymentProofUrl = req.file ? req.file.path : null;
    if (!paymentProofUrl) {
      return res.status(400).json({ success: false, message: 'Payment proof is required' });
    }

    // Parse Roster if it's a string (formData sends arrays as strings)
    let parsedRoster = [];
    if (isTeamApplication === 'true' && roster) {
        try {
            parsedRoster = JSON.parse(roster);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid roster format' });
        }
    }

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      paymentProofUrl,
      subscriptionStatus: 'pending',
      teamRegistration: {
        isApplicant: isTeamApplication === 'true',
        teamName: isTeamApplication === 'true' ? teamName : undefined,
        conference: isTeamApplication === 'true' ? conference : undefined,
        roster: parsedRoster
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
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

// Get all users (for admin dashboard)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Approve Payment & Auto-Generate Team/Players
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body; 
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If status is changing to 'active' AND it's a team application
    if (status === 'active' && user.subscriptionStatus !== 'active') {
        
        // Logic for Team Creation
        if (user.teamRegistration && user.teamRegistration.isApplicant) {
            const { teamName, conference, roster } = user.teamRegistration;

            // 1. Check if team name exists to prevent duplicates
            const teamExists = await Team.findOne({ name: teamName });
            
            if (!teamExists) {
                // Create the Team
                await Team.create({
                    name: teamName,
                    conference: conference || 'East',
                    logoUrl: 'https://via.placeholder.com/150?text=' + teamName.substring(0,3) 
                });

                // 2. Create Players for this Team
                if (roster && roster.length > 0) {
                    const playerPromises = roster.map(p => {
                        return Player.create({
                            name: p.name,
                            team: teamName,
                            position: p.position || 'PG',
                            gender: p.gender || 'Male',
                            jerseyNumber: p.jerseyNumber || '0',
                            // Default placeholder image
                            imageUrl: 'https://via.placeholder.com/150?text=Player' 
                        });
                    });
                    await Promise.all(playerPromises);
                }
            }
        }

        // Set expiration date (30 days)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        user.subscriptionExpiresAt = expiryDate;
    }

    user.subscriptionStatus = status;
    if (status !== 'active') user.subscriptionExpiresAt = null;

    await user.save();

    // Notify frontend (Socket)
    const io = req.app.get('io');
    if(io) {
      io.emit('players_updated'); // Refresh standings/players lists
      io.emit('standings_updated');
    }

    res.json({ success: true, message: `User updated to ${status}`, data: user });
  } catch (error) {
    next(error);
  }
};