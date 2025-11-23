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

// Simple and effective CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Backup CORS using cors package
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stripe', stripeRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "Server is working! 🎉",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    databaseState: {
      0: 'Disconnected',
      1: 'Connected', 
      2: 'Connecting',
      3: 'Disconnecting'
    }[mongoose.connection.readyState],
    cors: "CORS enabled for all origins",
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET
    },
    timestamp: new Date().toISOString()
  });
});

// CORS test route
app.get('/test-cors', (req, res) => {
  res.json({
    message: "CORS test successful!",
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb+srv://sajjadkhan:123@cluster0.zof6ban.mongodb.net/quiz_app?retryWrites=true&w=majority";

console.log('🔍 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  })
  .catch((error) => {
    console.log('❌ MongoDB connection error:', error.message);
    console.log('🔗 Connection string used:', MONGODB_URI.replace(/\/\/[^:]*:[^@]*@/, '//***:***@'));
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