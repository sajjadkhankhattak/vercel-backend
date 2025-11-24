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
    console.log("✅ CREATE QUIZ - User:", req.user?.email);

    // Validate required fields
    if (!title || !category) {
      console.log("❌ Missing required fields:", { title: !!title, category: !!category });
      return res.status(400).json({
        success: false,
        message: "Title and category are required"
      });
    }

    // Parse questions if they come as string (from FormData)
    let parsedQuestions;
    try {
      parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
    } catch (parseError) {
      console.log("❌ Questions parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid questions format"
      });
    }

    if (!parsedQuestions || parsedQuestions.length === 0) {
      console.log("❌ No questions provided");
      return res.status(400).json({
        success: false,
        message: "At least one question is required"
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        const validation = validateImage(req.file);
        if (!validation.isValid) {
          console.log("❌ Image validation failed:", validation.error);
          return res.status(400).json({
            success: false,
            message: validation.error
          });
        }

        // Convert image to base64
        image = convertToBase64(req.file.buffer, req.file.mimetype);
        imageType = req.file.mimetype;
        
        console.log(`✅ Image processed: ${req.file.mimetype}, Size: ${Math.round(req.file.size / 1024)}KB`);
      } catch (imageError) {
        console.log("❌ Image processing error:", imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to process image"
        });
      }
    }

    // Create quiz in MongoDB
    try {
      const newQuiz = new Quiz({
        title,
        description,
        category,
        tags: typeof tags === 'string' ? JSON.parse(tags || '[]') : (tags || []),
        duration,
        difficulty,
        questions: parsedQuestions,
        ...(image && { image, imageType })
      });

      console.log("✅ Attempting to save quiz to database...");
      const savedQuiz = await newQuiz.save();
      console.log("✅ Quiz saved successfully:", savedQuiz._id);
      
      res.status(201).json({
        success: true,
        message: "Quiz created successfully!",
        quiz: savedQuiz
      });
    } catch (dbError) {
      console.log("❌ Database save error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to save quiz to database",
        error: dbError.message
      });
    }

  } catch (error) {
    console.error("❌ Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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