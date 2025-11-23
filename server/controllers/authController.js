import User from '../models/User.js';
import Team from '../models/Teams.js';
import Player from '../models/Player.js';
import Game from '../models/Game.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- AUTHENTICATION ---

export const register = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

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
      subscriptionStatus: 'pending',
    });
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// --- SUBSCRIBER REQUESTS ---

export const submitTeamApplication = async (req, res, next) => {
  try {
    const { userId, teamName, conference, roster } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.teamRegistration = {
      isApplicant: true,
      status: 'pending',
      teamName,
      conference,
      roster: roster
    };
    await user.save();
    res.json({ success: true, message: 'Team application submitted.' });
  } catch (error) {
    next(error);
  }
};

export const submitPlayerStats = async (req, res, next) => {
  try {
    const { userId, playerName, stats } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.statRequests.push({ playerName, stats, status: 'pending' });
    await user.save();
    res.json({ success: true, message: 'Stats submitted for approval.' });
  } catch (error) {
    next(error);
  }
};

export const registerForGame = async (req, res, next) => {
  try {
    const { userId, gameId, teamName, roster } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.gameRequests.push({ gameId, teamName, roster, status: 'pending' });
    await user.save();
    res.json({ success: true, message: 'Game registration submitted.' });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN CONTROLLERS ---

// 1. Get Dashboard Data
export const getAdminDashboardData = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ subscriptionStatus: 'pending' }).select('-password');
    
    // Get users with pending requests
    const usersWithTeamReqs = await User.find({ 'teamRegistration.status': 'pending' }).select('name email teamRegistration');
    
    // Get all users and filter purely for those with pending array items
    const allUsers = await User.find({}).select('name email statRequests gameRequests');
    
    const statReqs = [];
    const gameReqs = [];

    allUsers.forEach(u => {
      if (u.statRequests) {
        u.statRequests.forEach(s => {
          if (s.status === 'pending') statReqs.push({ ...s.toObject(), userName: u.name, userId: u._id, reqId: s._id });
        });
      }
      if (u.gameRequests) {
        u.gameRequests.forEach(g => {
          if (g.status === 'pending') gameReqs.push({ ...g.toObject(), userName: u.name, userId: u._id, reqId: g._id });
        });
      }
    });

    res.json({
      success: true,
      data: {
        pendingUsers,
        teamRequests: usersWithTeamReqs,
        statRequests: statReqs,
        gameRequests: gameReqs
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Approve/Reject Subscription
export const handleSubscription = async (req, res, next) => {
  try {
    const { userId, status } = req.body; // 'active' or 'rejected'
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscriptionStatus = status;
    if (status === 'active') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      user.subscriptionExpiresAt = d;
    } else {
      user.subscriptionExpiresAt = null;
    }
    await user.save();
    res.json({ success: true, message: `User subscription ${status}` });
  } catch (error) {
    next(error);
  }
};

// 3. Handle Team Request
export const handleTeamRequest = async (req, res, next) => {
  try {
    const { userId, action } = req.body; // action: 'approve' or 'reject'
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = user.teamRegistration;

    if (action === 'approve') {
      // Check duplicate team
      const exists = await Team.findOne({ name: reg.teamName });
      if (exists) return res.status(400).json({ message: 'Team name already taken' });

      // Create Team
      await Team.create({
        name: reg.teamName,
        conference: reg.conference || 'East',
        logoUrl: 'https://via.placeholder.com/150?text=' + reg.teamName.substring(0,3)
      });

      // Create Players
      if (reg.roster && reg.roster.length > 0) {
        const promises = reg.roster.map(p => Player.create({
          name: p.name,
          team: reg.teamName,
          position: p.position,
          jerseyNumber: p.jerseyNumber,
          imageUrl: 'https://via.placeholder.com/150?text=' + p.name.substring(0,1)
        }));
        await Promise.all(promises);
      }
      user.teamRegistration.status = 'approved';
    } else {
      user.teamRegistration.status = 'rejected';
    }

    await user.save();
    res.json({ success: true, message: `Team request ${action}d` });
  } catch (error) {
    next(error);
  }
};

// 4. Handle Stats Request (ROBUST VERSION)
export const handleStatRequest = async (req, res, next) => {
  try {
    const { userId, reqId, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const statReq = user.statRequests.id(reqId);
    if (!statReq) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      // Validate Player Exists
      // Case insensitive search for better matching
      const player = await Player.findOne({ 
        name: { $regex: new RegExp(`^${statReq.playerName}$`, 'i') } 
      });

      if (player) {
        // Validate Stats Object Exists
        if (!statReq.stats) {
          // If stats are missing but we want to clear the request, we can just reject it or mark it approved without changes
          // Here we fail it to let admin know
          return res.status(400).json({ message: 'Request contains no stat data' });
        }

        // Calculate New Averages
        // Ensure values are numbers, default to 0 if missing
        const newPPG = parseFloat(statReq.stats.ppg || 0);
        const newRPG = parseFloat(statReq.stats.rpg || 0);
        const newAPG = parseFloat(statReq.stats.apg || 0);
        const newSPG = parseFloat(statReq.stats.spg || 0);
        const newBPG = parseFloat(statReq.stats.bpg || 0);

        const n = player.gamesPlayed || 0;
        const nextN = n + 1;

        // Weighted Average Formula: ((OldAvg * N) + NewVal) / (N + 1)
        player.ppg = (((player.ppg || 0) * n) + newPPG) / nextN;
        player.rpg = (((player.rpg || 0) * n) + newRPG) / nextN;
        player.apg = (((player.apg || 0) * n) + newAPG) / nextN;
        player.spg = (((player.spg || 0) * n) + newSPG) / nextN;
        player.bpg = (((player.bpg || 0) * n) + newBPG) / nextN;
        
        // Fix to 1 decimal place
        player.ppg = parseFloat(player.ppg.toFixed(1));
        player.rpg = parseFloat(player.rpg.toFixed(1));
        player.apg = parseFloat(player.apg.toFixed(1));
        player.spg = parseFloat(player.spg.toFixed(1));
        player.bpg = parseFloat(player.bpg.toFixed(1));

        player.gamesPlayed += 1;
        
        await player.save();
        statReq.status = 'approved';
      } else {
        return res.status(400).json({ 
          message: `Player "${statReq.playerName}" not found. Please create the player first in "Manage League".` 
        });
      }
    } else {
      statReq.status = 'rejected';
    }

    await user.save();
    res.json({ success: true, message: `Stats request ${action}d` });
  } catch (error) {
    console.error("Handle Stat Request Error:", error);
    res.status(500).json({ message: "Server error processing stats" });
  }
};

// 5. Handle Game Request
export const handleGameRequest = async (req, res, next) => {
  try {
    const { userId, reqId, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const gameReq = user.gameRequests.id(reqId);
    if (!gameReq) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      // Add user to game
      const game = await Game.findById(gameReq.gameId);
      if(game) {
        // Check if already registered
        if(!game.registeredUsers.includes(userId)){
           game.registeredUsers.push(userId);
           await game.save();
        }
        gameReq.status = 'approved';
      } else {
        return res.status(404).json({ message: 'Game not found' });
      }
    } else {
      gameReq.status = 'rejected';
    }

    await user.save();
    res.json({ success: true, message: `Game request ${action}d` });
  } catch (error) {
    next(error);
  }
};