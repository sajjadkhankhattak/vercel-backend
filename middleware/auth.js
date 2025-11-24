import jwt from 'jsonwebtoken';
import { User } from '../models/quiz_app.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('JWT verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// List of admin email addresses - UPDATE THIS LIST
const ADMIN_EMAILS = [
  'stylishkhan760@gmail.com',   // Current user - ADDED
  'admin@quizapp.com',          // Add your admin emails here
  'sajjadkhankhattak@gmail.com' // Add more admin emails as needed
];

// Middleware to check if user is admin based on email
export const requireAdmin = (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user email is in admin list
    if (!ADMIN_EMAILS.includes(req.user.email)) {
      console.log(`🔒 Admin access denied for email: ${req.user.email}`);
      return res.status(403).json({
        success: false,
        message: 'Admin access denied. Only authorized administrators can access this resource.',
        userEmail: req.user.email
      });
    }

    console.log(`✅ Admin access granted for email: ${req.user.email}`);
    next();
  } catch (error) {
    console.error('Admin validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin validation failed'
    });
  }
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h' // Token expires in 24 hours
    }
  );
};