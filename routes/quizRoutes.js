import express from "express";
import { createQuiz, getQuizzes } from "../controller/quiz_app.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { uploadImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Quiz Routes
router.post("/", 
  authenticateToken, 
  requireAdmin, 
  (req, res, next) => {
    // Try upload middleware, but continue if it fails
    try {
      uploadImage(req, res, next);
    } catch (error) {
      console.log("⚠️ Upload middleware error, continuing without file:", error.message);
      next();
    }
  },
  createQuiz
);

router.get("/", getQuizzes); // Public: Anyone can view quizzes

export default router;
