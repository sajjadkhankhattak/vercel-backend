import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://vercel-frontend-eta-ten.vercel.app',
    'https://vercel-frontend-sajjadkhankhattak.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stripe', stripeRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "Server is working! 🎉",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sajjadkhan:123@cluster0.zof6ban.mongodb.net/quiz_app?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.log('❌ MongoDB connection error:', error.message);
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});