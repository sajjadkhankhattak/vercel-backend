import express from "express";
import { signup, login } from "../controller/quiz_app.js";

const router = express.Router();

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);

export default router;
