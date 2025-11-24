import { User, Quiz } from '../models/quiz_app.js';
import { convertToBase64, validateImage } from '../middleware/upload.js';

// CREATE QUIZ - Save quiz to MongoDB with optional image
export const createQuiz = async (req, res) => {
  try {
    const { title, description, category, tags, duration, difficulty, questions } = req.body;
    let image = null;
    let imageType = null;
    
    console.log("✅ CREATE QUIZ - Received:", req.body);
    console.log("✅ CREATE QUIZ - File:", req.file ? 'Image attached' : 'No image');

    // Validate required fields
    if (!title || !category || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and at least one question are required"
      });
    }

    // Handle image upload if provided
    if (req.file) {
      const validation = validateImage(req.file);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Convert image to base64
      image = convertToBase64(req.file.buffer, req.file.mimetype);
      imageType = req.file.mimetype;
      
      console.log(`✅ Image processed: ${req.file.mimetype}, Size: ${Math.round(req.file.size / 1024)}KB`);
    }

    // Create quiz in MongoDB
    const newQuiz = new Quiz({
      title,
      description,
      category,
      tags,
      duration,
      difficulty,
      questions,
      ...(image && { image, imageType })
    });

    const savedQuiz = await newQuiz.save();
    
    res.status(201).json({
      success: true,
      message: "Quiz created successfully!",
      quiz: savedQuiz
    });

  } catch (error) {
    console.error("❌ Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message
    });
  }
};

// GET ALL QUIZZES
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    
    res.json({
      success: true,
      message: "Quizzes fetched successfully!",
      quizzes: quizzes
    });

  } catch (error) {
    console.error("❌ Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message
    });
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      message: "Users fetched successfully!",
      users: users
    });

  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log("✅ UPDATE USER - Received:", { userId, updateData });

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User updated successfully!",
      user: updatedUser
    });

  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("✅ DELETE USER - Received:", { userId });

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully!",
      user: deletedUser
    });

  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};