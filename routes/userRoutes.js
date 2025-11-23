import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controller/quiz_app.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all users - Protected
router.get("/", authenticateToken, getAllUsers);

// Update user - Protected
router.put("/:userId", authenticateToken, updateUser);

// Delete user - Protected
router.delete("/:userId", authenticateToken, deleteUser);

export default router;
