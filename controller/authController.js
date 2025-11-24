import { User } from '../models/quiz_app.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

// List of admin email addresses - KEEP THIS IN SYNC WITH MIDDLEWARE
const ADMIN_EMAILS = [
  'stylishkhan760@gmail.com',   // Current user
  'admin@quizapp.com',          // Add your admin emails here  
  'sajjadkhankhattak@gmail.com' // Add more admin emails as needed
];

// SIGNUP - Create new user in MongoDB
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    console.log("✅ SIGNUP - Received:", { firstName, lastName, email });

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if user already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in MongoDB
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = generateToken(savedUser._id);
    
    console.log("✅ User saved to database:", savedUser._id);
    
    res.status(201).json({ 
      success: true,
      message: "Account created successfully!", 
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email
      },
      token
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// LOGIN - Authenticate user from MongoDB
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("✅ LOGIN - Received:", { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user in database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    console.log("✅ Login successful for user:", user._id);

    res.json({ 
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// GET CURRENT USER PROFILE - Protected route
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is already available from authenticateToken middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email);

    res.json({
      success: true,
      message: 'User profile fetched successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        isAdmin: isAdmin
      }
    });

  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// CHECK ADMIN STATUS - Protected route
export const checkAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email);

    res.json({
      success: true,
      isAdmin: isAdmin,
      email: user.email,
      message: isAdmin ? 'User has admin access' : 'User does not have admin access'
    });

  } catch (error) {
    console.error('❌ Check admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check admin status',
      error: error.message
    });
  }
};