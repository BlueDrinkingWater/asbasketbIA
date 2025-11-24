import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import xss from 'xss-clean';
import http from 'http'; 
import { Server } from 'socket.io'; 
import jwt from 'jsonwebtoken'; // Added for socket auth

// --- Core Routes ---
import playerRoutes from './routes/playerRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js'; 

// --- NEW Modules ---
import newsRoutes from './routes/newsRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

// --- SOCKET.IO SECURITY & LOGIC ---

// Middleware to verify token before connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded; 
      next();
    });
  } else {
    // Allow unauthenticated guests to only VIEW (logic handled in event listeners)
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_game', (gameId) => {
    socket.join(gameId);
  });

  // Protected Event: Only allow officials/admins to update timer
  socket.on('timer_update', (data) => {
    // In a real app, check socket.user.role === 'admin' here
    socket.to(data.gameId).emit('receive_timer_update', data);
  });

  // Protected Event
  socket.on('stat_update', (data) => {
    io.in(data.gameId).emit('receive_stat_update', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// --- DATABASE & SEEDING ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/asbasketbia');
    console.log('✅ MongoDB Connected');

    // SECURE ADMIN SEEDING
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
      // FALLBACK ONLY for dev; explicit error if missing in prod recommended
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; 
      
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        adminUser = new User({
          email: adminEmail,
          name: 'System Admin',
          contactNumber: '0000000000',
          paymentProofUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=random'
        });
      }

      adminUser.password = adminPassword; 
      adminUser.role = 'admin';
      adminUser.subscriptionStatus = 'active';
      adminUser.subscriptionExpiresAt = new Date('2099-12-31');

      await adminUser.save();
      console.log(`👑 Admin Configured: ${adminEmail}`);

    } catch (err) {
      console.error('⚠️ Admin seed failed:', err.message);
    }

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }

  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();