import express from "express";
import { signup, login, getCurrentUser, checkAdminStatus } from "../controller/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authenticateToken, getCurrentUser); // Protected route to get current user
router.get("/admin-status", authenticateToken, checkAdminStatus); // Protected route to check admin status

export default router;
