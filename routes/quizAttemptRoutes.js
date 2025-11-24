import express from "express";
import { 
  submitQuizAttempt, 
  getQuizAttemptResult, 
  getUserQuizHistory, 
  getQuizAttempts, 
  getQuizLeaderboard 
} from "../controller/quizAttemptController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Test endpoint for debugging
router.get("/test", async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection;
    
    res.json({
      success: true,
      message: "Quiz attempts routes working",
      userId: req.user.id,
      dbState: db.readyState,
      dbName: db.db?.databaseName || "unknown",
      collections: await db.db?.listCollections().toArray() || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message
    });
  }
});

// Quiz Attempt Routes
// Submit quiz attempt
router.post("/:quizId/submit", submitQuizAttempt);

// Get specific quiz attempt result
router.get("/result/:attemptId", getQuizAttemptResult);

// Get user's quiz history
router.get("/history", getUserQuizHistory);

// Get user's attempts for specific quiz
router.get("/:quizId/attempts", getQuizAttempts);

// Get quiz leaderboard (top scores)
router.get("/:quizId/leaderboard", getQuizLeaderboard);

export default router;