import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controller/quiz_app.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all users - Protected: Admin only
router.get("/", authenticateToken, requireAdmin, getAllUsers);

// Update user - Protected: Admin only
router.put("/:userId", authenticateToken, requireAdmin, updateUser);

// Delete user - Protected: Admin only
router.delete("/:userId", authenticateToken, requireAdmin, deleteUser);

export default router;
