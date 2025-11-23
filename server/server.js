import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import xss from 'xss-clean';
import http from 'http'; // Required for Socket.io
import { Server } from 'socket.io'; // Required for Socket.io

// Routes
import playerRoutes from './routes/playerRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
// Ensure you created this file, otherwise comment it out to prevent crashes
import authRoutes from './routes/authRoutes.js'; 
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server for Socket.io
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow Vite client
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available in routes via req.app.get('io')
app.set('io', io);

// Middleware
app.use(helmet());
// CORS: Allow your frontend to connect
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  .then(() => {
    console.log('✅ MongoDB Connected');
    // Only start server if DB connects
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Server will NOT start because database connection failed.');
    process.exit(1); // Exit process so you know it failed
  });