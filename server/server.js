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

// Routes
import playerRoutes from './routes/playerRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import { errorHandler } from './middleware/errorHandler.js';

// Import User model for Admin Seeding
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server for Socket.io
const server = http.createServer(app);

// 2. Initialize Socket.io
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

// Rate Limiting
// FIXED: Increased limit to 1000 to prevent 429 errors during development/testing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/games', gameRoutes);

// Global Error Handler
app.use(errorHandler);

// Socket.io Connection Event
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// 3. Database Connection & Server Startup
console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // --- FORCE ADMIN RESET/CREATE ---
    try {
      const adminEmail = 'admin@gmail.com';
      const adminPassword = 'admin123';
      
      // Try to find the user
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        // Create new instance if not found
        adminUser = new User({
          email: adminEmail,
          name: 'System Admin',
          contactNumber: '0000000000',
          // FIXED: Use a more reliable placeholder service
          paymentProofUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=random'
        });
      }

      // FORCE UPDATE credentials and permissions
      adminUser.password = adminPassword; 
      adminUser.role = 'admin';
      adminUser.subscriptionStatus = 'active';
      adminUser.subscriptionExpiresAt = new Date('2099-12-31');

      await adminUser.save();

      console.log('👑 -----------------------------------------');
      console.log(`👑 ADMIN READY:     ${adminEmail}`);
      console.log(`👑 PASSWORD RESET:  ${adminPassword}`);
      console.log('👑 -----------------------------------------');

    } catch (err) {
      console.error('⚠️ Failed to seed admin user:', err.message);
    }
    // ------------------------------

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Server will NOT start because database connection failed.');
    process.exit(1); 
  });