import express from "express";
import { createQuiz, getQuizzes } from "../controller/quiz_app.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { uploadImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Quiz Routes
router.post("/", 
  authenticateToken, 
  requireAdmin, 
  uploadImage, 
  handleUploadError, 
  createQuiz
); // Protected: Admin only can create quizzes with optional image

router.get("/", getQuizzes); // Public: Anyone can view quizzes

export default router;
