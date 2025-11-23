import express from "express";
import { createQuiz, getQuizzes } from "../controller/quiz_app.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Quiz Routes
router.post("/", authenticateToken, createQuiz); // Protected: Only authenticated users can create quizzes
router.get("/", getQuizzes); // Public: Anyone can view quizzes

export default router;
