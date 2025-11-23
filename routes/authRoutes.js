import express from "express";
import { signup, login, getCurrentUser } from "../controller/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticateToken, getCurrentUser); // Protected route to get current user

export default router;
