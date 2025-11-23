import express from "express";
import { createQuiz, getQuizzes } from "../controller/quiz_app.js";

const router = express.Router();

// Quiz Routes
router.post("/", createQuiz);
router.get("/", getQuizzes);

export default router;
