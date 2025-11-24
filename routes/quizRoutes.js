import express from "express";
import { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz } from "../controller/quiz_app.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { uploadImage, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// Quiz Routes
// CREATE quiz (admin only)
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

// GET all quizzes (public)
router.get("/", getQuizzes);

// GET quiz by ID (public)
router.get("/:id", getQuizById);

// UPDATE quiz (admin only)
router.put("/:id", 
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
  updateQuiz
);

// DELETE quiz (admin only)
router.delete("/:id", 
  authenticateToken, 
  requireAdmin, 
  deleteQuiz
);

export default router;
