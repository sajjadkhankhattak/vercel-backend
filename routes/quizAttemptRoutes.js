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